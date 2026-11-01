import { supabase, COVER_BUCKET } from "../lib/supabase";
import type {
  CatalogPrompt,
  DeepSeekPrompt,
  PromptCategory,
  PromptInput,
} from "./types";
export class ValidationError extends Error {}
function db() {
  if (!supabase) throw new Error("Подключение Supabase ещё не настроено.");
  return supabase;
}
export function explainError(error: unknown) {
  if (error instanceof ValidationError) return error.message;
  const e = error as { code?: string; message?: string };
  if (e?.code === "23505")
    return "Такое название или идентификатор уже существует.";
  if (e?.code === "23503")
    return "Категория используется в промптах. Сначала назначьте им другую категорию.";
  if (e?.code === "42501" || e?.code === "PGRST301")
    return "Нет прав на изменение. Войдите под аккаунтом администратора.";
  if (e?.code === "PGRST116")
    return "Запись уже изменена или удалена. Обновите список и повторите действие.";
  if (e?.code === "23514")
    return "Проверьте длину текста, название и количество тегов.";
  return "Не удалось выполнить запрос. Проверьте соединение, настройку Supabase и повторите попытку.";
}
async function rows<T>(table: string, publishedOnly = false): Promise<T[]> {
  const all: T[] = [];
  for (let offset = 0; ; offset += 500) {
    let q = db()
      .from(table)
      .select("*")
      .order("sort_order")
      .order("created_at")
      .range(offset, offset + 499);
    if (publishedOnly) q = q.eq("published", true);
    const { data, error } = await q;
    if (error) throw error;
    all.push(...(data as T[]));
    if (data.length < 500) return all;
  }
}
export const getCategories = () => rows<PromptCategory>("prompt_categories");
export const getPrompts = (publicOnly = false) =>
  rows<DeepSeekPrompt>("deepseek_prompts", publicOnly);
export async function withCovers(
  prompts: DeepSeekPrompt[],
): Promise<CatalogPrompt[]> {
  const paths = [
    ...new Set(
      prompts.map((p) => p.cover_path).filter((p): p is string => Boolean(p)),
    ),
  ];
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data, error } = await db()
      .storage.from(COVER_BUCKET)
      .createSignedUrls(paths, 300);
    if (error) throw error;
    for (const image of data) {
      if (image.path && image.signedUrl && !image.error)
        urls.set(image.path, image.signedUrl);
    }
  }
  return prompts.map((p) => ({
    ...p,
    cover_url: p.cover_path ? (urls.get(p.cover_path) ?? null) : null,
  }));
}
export function validatePrompt(input: PromptInput) {
  if (!input.title.trim() || input.title.length > 120)
    throw new ValidationError(
      "Название должно содержать от 1 до 120 символов.",
    );
  if (!input.category_id) throw new ValidationError("Выберите категорию.");
  if (!input.description.trim() || input.description.length > 500)
    throw new ValidationError(
      "Описание должно содержать от 1 до 500 символов.",
    );
  if (!input.content.trim() || input.content.length > 30000)
    throw new ValidationError(
      "Текст промпта должен содержать от 1 до 30 000 символов.",
    );
  if (input.tags.length > 12 || input.tags.some((t) => t.length > 40))
    throw new ValidationError(
      "Можно добавить до 12 тегов, каждый не длиннее 40 символов.",
    );
}
export async function uploadCover(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new ValidationError(
      "Выберите изображение JPG, PNG или WebP. SVG не поддерживается.",
    );
  if (file.size > 5 * 1024 * 1024)
    throw new ValidationError("Размер обложки должен быть не больше 5 МБ.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ValidationError(
      "Не удалось прочитать изображение. Выберите другой файл.",
    );
  }
  const tooLarge = bitmap.width > 6000 || bitmap.height > 6000;
  bitmap.close();
  if (tooLarge)
    throw new ValidationError(
      "Максимальный размер обложки — 6000 × 6000 пикселей.",
    );
  const ext =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : "webp";
  const path = `covers/${crypto.randomUUID()}.${ext}`;
  const { error } = await db().storage.from(COVER_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}
async function removeCover(path: string) {
  try {
    const { error } = await db().storage.from(COVER_BUCKET).remove([path]);
    return !error;
  } catch {
    return false;
  }
}
export async function savePrompt(
  input: PromptInput,
  old: DeepSeekPrompt | null,
  file: File | null,
  removeImage: boolean,
) {
  validatePrompt(input);
  let newPath: string | null = null;
  if (file) newPath = await uploadCover(file);
  const values = {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    content: input.content.trim(),
    cover_path: newPath ?? (removeImage ? null : input.cover_path),
  };
  try {
    const result = old
      ? await db()
          .from("deepseek_prompts")
          .update(values)
          .eq("id", old.id)
          .eq("updated_at", old.updated_at)
          .select()
          .single()
      : await db().from("deepseek_prompts").insert(values).select().single();
    if (result.error) throw result.error;
    const coverCleanupFailed = Boolean(
      old?.cover_path &&
      old.cover_path !== values.cover_path &&
      !(await removeCover(old.cover_path)),
    );
    return { prompt: result.data as DeepSeekPrompt, coverCleanupFailed };
  } catch (error) {
    if (newPath) await removeCover(newPath);
    throw error;
  }
}
export async function setPublished(prompt: DeepSeekPrompt, published: boolean) {
  const { error } = await db()
    .from("deepseek_prompts")
    .update({ published })
    .eq("id", prompt.id)
    .eq("updated_at", prompt.updated_at)
    .select("id")
    .single();
  if (error) throw error;
}
export async function deletePrompt(prompt: DeepSeekPrompt) {
  const { data, error } = await db()
    .from("deepseek_prompts")
    .delete()
    .eq("id", prompt.id)
    .eq("updated_at", prompt.updated_at)
    .select("id");
  if (error) throw error;
  if (!data.length) throw { code: "PGRST116" };
  return !prompt.cover_path || (await removeCover(prompt.cover_path));
}
export async function reorderPrompts(ids: string[]) {
  const { error } = await db().rpc("admin_reorder_prompts", { p_ids: ids });
  if (error) throw error;
}
export async function createCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 80)
    throw new ValidationError(
      "Название категории должно содержать от 1 до 80 символов.",
    );
  const slug = `category-${crypto.randomUUID()}`;
  const { error } = await db()
    .from("prompt_categories")
    .insert({ name: trimmed, slug });
  if (error) throw error;
}
export async function renameCategory(category: PromptCategory, name: string) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 80)
    throw new ValidationError(
      "Название категории должно содержать от 1 до 80 символов.",
    );
  const { error } = await db()
    .from("prompt_categories")
    .update({ name: trimmed })
    .eq("id", category.id)
    .eq("updated_at", category.updated_at)
    .select("id")
    .single();
  if (error) throw error;
}
export async function deleteCategory(id: string) {
  const { error } = await db().from("prompt_categories").delete().eq("id", id);
  if (error) throw error;
}
export async function reorderCategories(ids: string[]) {
  const { error } = await db().rpc("admin_reorder_categories", { p_ids: ids });
  if (error) throw error;
}
