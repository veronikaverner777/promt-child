import { test, expect, type Page } from "@playwright/test";
const stamp = () => new Date().toISOString();
const category = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Творчество",
  slug: "creative",
  sort_order: 0,
  created_at: stamp(),
  updated_at: stamp(),
};
const basePrompt = {
  id: "33333333-3333-4333-8333-333333333333",
  title: "Сочини историю",
  category_id: category.id,
  description: "Придумай приключение вместе с ИИ.",
  content: "Помоги придумать историю про дружбу.",
  cover_path: null as string | null,
  tags: ["истории"],
  published: true,
  sort_order: 0,
  published_at: stamp(),
  created_at: stamp(),
  updated_at: stamp(),
  created_by: null,
};
async function mockSupabase(page: Page, admin = true) {
  const state = {
    categories: [{ ...category }],
    prompts: [structuredClone(basePrompt)],
    uploads: 0,
    removed: 0,
    failSave: false,
    writes: 0,
  };
  const user = {
    id: "22222222-2222-4222-8222-222222222222",
    aud: "authenticated",
    role: "authenticated",
    email: "admin@example.test",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    created_at: stamp(),
  };
  const enc = (x: unknown) =>
    Buffer.from(JSON.stringify(x)).toString("base64url");
  const token = `${enc({ alg: "HS256", typ: "JWT" })}.${enc({ sub: user.id, role: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000), iss: "supabase" })}.test_signature`;
  await page.route("https://aip-test.supabase.co/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      method = req.method(),
      path = url.pathname;
    const respond = (data: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify(data),
      });
    if (method === "OPTIONS")
      return route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "*",
        },
      });
    if (path === "/auth/v1/token") {
      if (req.postDataJSON().password === "wrong-password")
        return respond(
          { code: "invalid_credentials", msg: "Invalid login credentials" },
          400,
        );
      return respond({
        access_token: token,
        refresh_token: "mock_refresh_token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user,
      });
    }
    if (path === "/auth/v1/user") return respond(user);
    if (path === "/auth/v1/logout") return route.fulfill({ status: 204 });
    if (path === "/rest/v1/rpc/is_admin") return respond(admin);
    const authorized =
      admin && req.headers().authorization === `Bearer ${token}`;
    if (
      path.includes("/storage/v1/object/sign/deepseek-covers") &&
      method === "POST"
    )
      return respond(
        req.postDataJSON().paths.map((p: string) => {
          const allowed =
            authorized ||
            state.prompts.some(
              (prompt) => prompt.published && prompt.cover_path === p,
            );
          return {
            path: p,
            error: allowed ? null : "Not found",
            signedURL: allowed
              ? `/object/sign/deepseek-covers/${p}?token=mock`
              : null,
          };
        }),
      );
    if (method !== "GET" && !authorized)
      return respond({ code: "42501", message: "RLS denied" }, 403);
    if (path.startsWith("/storage/v1/object/sign/"))
      return route.fulfill({
        status: 200,
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          "base64",
        ),
      });
    if (
      path.startsWith("/storage/v1/object/deepseek-covers") &&
      method === "POST"
    ) {
      state.uploads++;
      return respond({
        Key: path.split("/object/")[1],
        Id: crypto.randomUUID(),
      });
    }
    if (
      path.startsWith("/storage/v1/object/deepseek-covers") &&
      method === "DELETE"
    ) {
      state.removed++;
      return respond([]);
    }
    if (path.startsWith("/rest/v1/rpc/admin_reorder_")) {
      const target = path.endsWith("categories")
        ? state.categories
        : state.prompts;
      const ids = req.postDataJSON().p_ids;
      for (const item of target) {
        item.sort_order = ids.indexOf(item.id);
        item.updated_at = stamp();
      }
      return respond(null);
    }
    if (path === "/rest/v1/prompt_categories") {
      if (method === "GET")
        return respond(
          [...state.categories].sort((a, b) => a.sort_order - b.sort_order),
        );
      state.writes++;
      if (method === "POST") {
        state.categories.push({
          ...category,
          ...req.postDataJSON(),
          id: crypto.randomUUID(),
          sort_order: state.categories.length,
        });
        return route.fulfill({ status: 201 });
      }
      const id = url.searchParams.get("id")?.slice(3),
        index = state.categories.findIndex((c) => c.id === id);
      if (method === "PATCH") {
        Object.assign(state.categories[index], req.postDataJSON(), {
          updated_at: stamp(),
        });
        return respond(state.categories[index]);
      }
      if (method === "DELETE") {
        if (state.prompts.some((p) => p.category_id === id))
          return respond({ code: "23503" }, 409);
        state.categories.splice(index, 1);
        return route.fulfill({ status: 204 });
      }
    }
    if (path === "/rest/v1/deepseek_prompts") {
      if (method === "GET")
        return respond(
          state.prompts
            .filter((p) =>
              url.searchParams.get("published") === "eq.true"
                ? p.published
                : authorized || p.published,
            )
            .sort((a, b) => a.sort_order - b.sort_order),
        );
      state.writes++;
      if (state.failSave) {
        state.failSave = false;
        return respond({ code: "23514" }, 400);
      }
      if (method === "POST") {
        const row = {
          ...basePrompt,
          ...req.postDataJSON(),
          id: crypto.randomUUID(),
          published: false,
          published_at: null,
          sort_order: state.prompts.length,
          updated_at: stamp(),
        };
        state.prompts.push(row);
        return respond(row, 201);
      }
      const id = url.searchParams.get("id")?.slice(3),
        index = state.prompts.findIndex((p) => p.id === id);
      if (method === "PATCH") {
        Object.assign(state.prompts[index], req.postDataJSON(), {
          updated_at: stamp(),
        });
        return respond(state.prompts[index]);
      }
      if (method === "DELETE") {
        state.prompts.splice(index, 1);
        return respond([{ id }]);
      }
    }
    return respond({ error: `Unhandled test request ${method} ${path}` }, 500);
  });
  return state;
}
async function login(page: Page, password = "correct-test-password") {
  await page.goto("/promt-child/#admin");
  await page.getByLabel("Email", { exact: true }).fill("admin@example.test");
  await page.getByLabel("Пароль", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Войти", exact: true }).click();
}
async function fill(page: Page, title: string) {
  await page.getByLabel("Название", { exact: true }).fill(title);
  await page
    .getByLabel("Описание", { exact: true })
    .fill("Создай интересный учебный проект.");
  await page
    .getByLabel("Полный текст промпта", { exact: true })
    .fill("Ты — помощник ученика. Объясни, как устроена Солнечная система.");
  await page.getByLabel("Теги", { exact: true }).fill("космос, учёба");
}
test("administrator: category, draft preview, publish, public catalog, edit, reorder, unpublish and delete", async ({
  page,
}) => {
  const state = await mockSupabase(page);
  await login(page);
  await expect(
    page.getByRole("button", { name: "Создать промпт", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Категории", exact: true }).click();
  await page.getByLabel("Новая категория").fill("Учёба");
  await page.getByRole("button", { name: "Добавить", exact: true }).click();
  await expect(page.locator(".category-edit-row")).toHaveCount(2);
  await page.getByRole("button", { name: "Закрыть", exact: true }).click();
  await page
    .getByRole("button", { name: "Создать промпт", exact: true })
    .click();
  await fill(page, "Космическая лаборатория");
  await page
    .getByLabel("Категория", { exact: true })
    .selectOption({ label: "Учёба" });
  await expect(page.locator(".editor-preview h3")).toHaveText(
    "Космическая лаборатория",
  );
  await page.screenshot({
    path: test.info().outputPath("editor.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Предпросмотр", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Предпросмотр промпта" }),
  ).toContainText("Космическая лаборатория");
  await page.getByRole("button", { name: "Закрыть", exact: true }).click();
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.locator(".admin-prompt-row")).toHaveCount(2);
  expect(state.prompts[1].published).toBe(false);
  await page
    .getByRole("navigation", { name: "Главная навигация" })
    .getByRole("button", { name: "Промпты DeepSeek" })
    .click();
  await expect(page.locator(".prompt-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Админ-панель", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Опубликовать Космическая лаборатория",
      exact: true,
    })
    .click();
  await expect(page.locator(".admin-notice")).toContainText("опубликован");
  await page
    .getByRole("button", { name: "Поднять промпт Космическая лаборатория" })
    .click();
  await expect(page.locator(".admin-prompt-row h3").first()).toHaveText(
    "Космическая лаборатория",
  );
  await page
    .getByRole("button", {
      name: "Редактировать Космическая лаборатория",
      exact: true,
    })
    .click();
  await page
    .getByLabel("Название", { exact: true })
    .fill("Лаборатория DeepSeek");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.locator(".admin-prompt-row h3").first()).toHaveText(
    "Лаборатория DeepSeek",
  );
  await page
    .getByRole("navigation", { name: "Главная навигация" })
    .getByRole("button", { name: "Обзор проектов 4", exact: true })
    .click();
  await expect(page.locator(".project-card")).toHaveCount(4);
  await expect(page.locator(".prompt-card h3").first()).toHaveText(
    "Лаборатория DeepSeek",
  );
  await page.getByRole("button", { name: "Админ-панель", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Снять с публикации Лаборатория DeepSeek",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Удалить промпт Лаборатория DeepSeek",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Удалить навсегда", exact: true })
    .click();
  await expect(page.locator(".admin-prompt-row")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".admin-prompt-row")).toHaveCount(1);
});
test("image upload is cleaned up when database save fails and can be retried", async ({
  page,
}) => {
  const state = await mockSupabase(page);
  await login(page);
  await page
    .getByRole("button", { name: "Создать промпт", exact: true })
    .click();
  await fill(page, "Обложка для идеи");
  const png = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 20;
    canvas.height = 20;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#9369be";
    ctx.fillRect(0, 0, 20, 20);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await page.getByLabel("Загрузить обложку").setInputFiles({
    name: "cover.png",
    mimeType: "image/png",
    buffer: Buffer.from(png, "base64"),
  });
  state.failSave = true;
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Проверьте длину");
  expect(state.uploads).toBe(1);
  expect(state.removed).toBe(1);
  await expect(page.getByLabel("Название", { exact: true })).toHaveValue(
    "Обложка для идеи",
  );
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.locator(".admin-prompt-row")).toHaveCount(2);
  expect(state.prompts[1].cover_path).toMatch(/^covers\/.*\.png$/);
  expect(state.uploads).toBe(2);
  await page
    .getByRole("button", { name: "Опубликовать Обложка для идеи", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Выйти из админ-панели", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Вход администратора" }),
  ).toBeVisible();
  await page.goto("/promt-child/#prompts");
  await expect(page.locator(".prompt-card")).toHaveCount(2);
  const publicImage = page.locator(".prompt-card img");
  await expect(publicImage).toBeVisible();
  await expect
    .poll(() =>
      publicImage.evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
});
test("invalid credentials and authenticated non-admin never open the editor", async ({
  page,
}) => {
  const state = await mockSupabase(page, false);
  await login(page, "wrong-password");
  await expect(page.getByRole("alert")).toContainText("Не удалось войти");
  await page
    .getByLabel("Пароль", { exact: true })
    .fill("correct-test-password");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Доступ только для администратора" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Создать промпт", exact: true }),
  ).toHaveCount(0);
  expect(state.writes).toBe(0);
});
test("catalog filters and mobile admin keep the Pages prefix", async ({
  page,
}) => {
  await mockSupabase(page);
  await page.goto("/promt-child/#prompts");
  await expect(page.locator(".prompt-card")).toHaveCount(1);
  await page.getByLabel("Поиск промптов").fill("нет такой идеи");
  await expect(page.locator(".prompt-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Сбросить фильтры" }).click();
  await page.locator(".prompt-card h3 button").click();
  await expect(page.getByRole("dialog")).toContainText("Сочини историю");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect(
    page.getByRole("button", { name: "Создать промпт", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Создать промпт", exact: true })
    .click();
  await fill(page, "Мобильная идея");
  await expect(page.locator(".editor-preview h3")).toHaveText("Мобильная идея");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(new URL(page.url()).pathname).toBe("/promt-child/");
});
