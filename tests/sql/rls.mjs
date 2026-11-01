import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
// Real PostgreSQL/RLS, with only the surrounding Supabase auth/storage tables
// emulated locally. This does not replace a smoke test against the user's project.
const db = new PGlite();
let checks = 0;
const admin = "11111111-1111-4111-8111-111111111111";
const member = "22222222-2222-4222-8222-222222222222";
const fixture = `
create role anon; create role authenticated;
create schema auth; create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;
grant usage on schema auth,public to anon,authenticated;
grant execute on function auth.uid() to anon,authenticated;
create schema storage;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
grant usage on schema storage to anon,authenticated;
grant select,insert,update,delete on storage.objects to anon,authenticated;
insert into auth.users values ('${admin}'),('${member}');
`;
const role = async (name, id = "") => {
  await db.exec(
    `reset role; set role ${name}; select set_config('request.jwt.claim.sub','${id}',false);`,
  );
};
const scalar = async (sql) => Object.values((await db.query(sql)).rows[0])[0];
async function denied(sql) {
  await assert.rejects(db.exec(sql));
  checks++;
}
try {
  await db.exec(fixture);
  const migration = await readFile(
    new URL(
      "../../supabase/migrations/202611010001_deepseek_catalog.sql",
      import.meta.url,
    ),
    "utf8",
  );
  await db.exec(migration);
  await db.exec(migration);
  checks++;
  await db.exec(
    `insert into private.admin_users(user_id) values ('${admin}');`,
  );
  await role("authenticated", admin);
  assert.equal(await scalar("select public.is_admin()"), true);
  checks++;
  const category = (
    await db.query(
      "insert into public.prompt_categories(name,slug) values ('Исследования','research') returning id",
    )
  ).rows[0].id;
  const draft = (
    await db.query(
      `insert into public.deepseek_prompts(title,category_id,description,content,tags) values ('Планета','${category}','Описание','Полный текст',array['космос']) returning id`,
    )
  ).rows[0].id;
  checks++;
  const cover = "covers/33333333-3333-4333-8333-333333333333.png";
  await db.exec(
    `insert into storage.objects(bucket_id,name) values ('deepseek-covers','${cover}');update public.deepseek_prompts set cover_path='${cover}' where id='${draft}';`,
  );
  await role("anon");
  assert.equal(
    await scalar("select count(*)::int from public.deepseek_prompts"),
    0,
  );
  assert.equal(await scalar("select count(*)::int from storage.objects"), 0);
  assert.equal(
    await scalar("select count(*)::int from public.prompt_categories"),
    1,
  );
  checks++;
  await denied(
    `insert into public.deepseek_prompts(title,category_id,description,content) values ('Hacked','${category}','d','c')`,
  );
  await denied(
    `insert into storage.objects(bucket_id,name) values ('deepseek-covers','hacked.png')`,
  );
  await role("authenticated", member);
  assert.equal(await scalar("select public.is_admin()"), false);
  checks++;
  await denied(`insert into private.admin_users(user_id) values ('${member}')`);
  await denied(
    "insert into public.prompt_categories(name,slug) values ('Bad','bad')",
  );
  await denied(
    `insert into public.deepseek_prompts(title,category_id,description,content) values ('Bad','${category}','d','c')`,
  );
  await denied(
    `select public.admin_reorder_prompts(array['${draft}']::uuid[])`,
  );
  await denied(
    `select public.admin_reorder_categories(array['${category}']::uuid[])`,
  );
  await denied(
    `insert into storage.objects(bucket_id,name) values ('deepseek-covers','hacked.png')`,
  );
  await role("authenticated", admin);
  await db.exec(
    `update public.deepseek_prompts set published=true where id='${draft}';`,
  );
  assert.notEqual(
    await scalar(
      `select published_at from public.deepseek_prompts where id='${draft}'`,
    ),
    null,
  );
  checks++;
  await role("anon");
  assert.equal(
    await scalar("select count(*)::int from public.deepseek_prompts"),
    1,
  );
  assert.equal(await scalar("select count(*)::int from storage.objects"), 1);
  checks++;
  await role("authenticated", member);
  await db.exec(
    `update public.deepseek_prompts set content='Tampered' where id='${draft}';delete from public.deepseek_prompts where id='${draft}';delete from storage.objects;`,
  );
  assert.equal(
    await scalar(
      `select content from public.deepseek_prompts where id='${draft}'`,
    ),
    "Полный текст",
  );
  assert.equal(await scalar("select count(*)::int from storage.objects"), 1);
  checks++;
  await role("authenticated", admin);
  const second = (
    await db.query(
      `insert into public.deepseek_prompts(title,category_id,description,content) values ('Вторая идея','${category}','Описание','Промпт') returning id`,
    )
  ).rows[0].id;
  await db.exec(
    `select public.admin_reorder_prompts(array['${second}','${draft}']::uuid[]);`,
  );
  assert.deepEqual(
    (
      await db.query(
        "select id from public.deepseek_prompts order by sort_order",
      )
    ).rows.map((r) => r.id),
    [second, draft],
  );
  checks++;
  await denied(
    `select public.admin_reorder_prompts(array['${draft}','${draft}']::uuid[])`,
  );
  await denied(`delete from public.prompt_categories where id='${category}'`);
  await db.exec(
    `update public.deepseek_prompts set published=false where id='${draft}';`,
  );
  await role("anon");
  assert.equal(
    await scalar("select count(*)::int from public.deepseek_prompts"),
    0,
  );
  assert.equal(await scalar("select count(*)::int from storage.objects"), 0);
  checks++;
  console.log(
    `${checks} PostgreSQL security checks passed: migration repeatability, admin role, draft/public reads, denied writes and self-promotion, protected images, ordering, category integrity, unpublication.`,
  );
} finally {
  await db.close();
}
