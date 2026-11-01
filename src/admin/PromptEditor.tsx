import { useEffect, useState } from "react";
import { ArrowLeft, Check, Eye, ImagePlus, Save, Trash2 } from "lucide-react";
import type {
  CatalogPrompt,
  DeepSeekPrompt,
  PromptCategory,
  PromptInput,
} from "../catalog/types";
import { PromptCard, PromptDetail } from "../catalog/PromptCard";
import { explainError, savePrompt } from "../catalog/api";
export default function PromptEditor({
  prompt,
  categories,
  onSave,
  onBack,
}: {
  prompt: CatalogPrompt | null;
  categories: PromptCategory[];
  onSave: (warning: boolean) => Promise<void>;
  onBack: () => void;
}) {
  const [title, setTitle] = useState(prompt?.title ?? ""),
    [category, setCategory] = useState(
      prompt?.category_id ?? categories[0]?.id ?? "",
    ),
    [description, setDescription] = useState(prompt?.description ?? ""),
    [content, setContent] = useState(prompt?.content ?? ""),
    [tags, setTags] = useState(prompt?.tags.join(", ") ?? ""),
    [file, setFile] = useState<File | null>(null),
    [removeImage, setRemoveImage] = useState(false),
    [localCover, setLocalCover] = useState<string | null>(null),
    [preview, setPreview] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!file) {
      setLocalCover(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalCover(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (!dirty) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  const input: PromptInput = {
    title,
    category_id: category,
    description,
    content,
    tags: [
      ...new Set(
        tags
          .split(",")
          .map((t) => t.trim().replace(/^#+/, ""))
          .filter(Boolean),
      ),
    ],
    cover_path: prompt?.cover_path ?? null,
  };
  const card: CatalogPrompt = {
    ...(prompt ?? {
      id: "preview",
      published: false,
      sort_order: 0,
      created_at: "",
      updated_at: "",
      created_by: null,
      published_at: null,
    }),
    ...input,
    cover_url: localCover ?? (removeImage ? null : (prompt?.cover_url ?? null)),
  };
  const back = () => {
    if (
      !dirty ||
      window.confirm(
        "Несохранённые изменения будут потеряны. Вернуться к списку?",
      )
    )
      onBack();
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await savePrompt(
        input,
        prompt as DeepSeekPrompt | null,
        file,
        removeImage,
      );
      setDirty(false);
      await onSave(result.coverCleanupFailed);
    } catch (e) {
      setError(explainError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="admin-editor">
      <button className="back-button" disabled={busy} onClick={back}>
        <ArrowLeft size={16} /> К списку промптов
      </button>
      <div className="admin-section-heading">
        <div>
          <span className="eyebrow accent">
            {prompt ? "РЕДАКТИРОВАНИЕ" : "НОВАЯ ИДЕЯ"}
          </span>
          <h2>{prompt ? "Редактировать промпт" : "Создать промпт"}</h2>
          <p className="muted">
            {prompt?.published
              ? "Изменения опубликованного промпта появятся в каталоге после сохранения."
              : "Сначала сохраните черновик, затем опубликуйте его из списка."}
          </p>
        </div>
        <span
          className={`admin-status ${prompt?.published ? "published" : "draft"}`}
        >
          {prompt?.published ? "Опубликован" : "Черновик"}
        </span>
      </div>
      <div className="admin-editor-layout">
        <form
          className="admin-form panel"
          onSubmit={save}
          onChange={() => setDirty(true)}
        >
          <fieldset disabled={busy}>
            <label>
              Название
              <input
                required
                maxLength={120}
                aria-label="Название"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например, Придумай свою планету"
              />
              <small>{title.length}/120</small>
            </label>
            <label>
              Категория
              <select
                required
                aria-label="Категория"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>
                  Выберите категорию
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Описание
              <textarea
                required
                maxLength={500}
                aria-label="Описание"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Что получится и кому пригодится этот промпт?"
              />
              <small>{description.length}/500</small>
            </label>
            <label>
              Полный текст промпта
              <textarea
                className="prompt-content-editor"
                required
                maxLength={30000}
                aria-label="Полный текст промпта"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ты — мой помощник по исследованию космоса…"
              />
              <small>{content.length.toLocaleString("ru-RU")}/30 000</small>
            </label>
            <label>
              Теги
              <input
                value={tags}
                aria-label="Теги"
                onChange={(e) => setTags(e.target.value)}
                maxLength={520}
                placeholder="учёба, космос, фантазия"
              />
              <small>Через запятую. До 12 тегов, каждый до 40 символов.</small>
            </label>
            <label className="cover-upload-label">
              Обложка
              <span className="cover-upload">
                <ImagePlus size={22} />
                <span>
                  {file ? file.name : "Загрузить изображение"}
                  <small>JPG, PNG, WebP · до 5 МБ · до 6000 × 6000 px</small>
                </span>
                <input
                  type="file"
                  aria-label="Загрузить обложку"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setRemoveImage(false);
                  }}
                />
              </span>
            </label>
            {(file || (prompt?.cover_path && !removeImage)) && (
              <button
                type="button"
                className="text-button danger"
                onClick={() => {
                  setFile(null);
                  setRemoveImage(true);
                  setDirty(true);
                }}
              >
                <Trash2 size={14} /> Убрать обложку
              </button>
            )}
            {error && (
              <div className="admin-error" role="alert">
                {error}
              </div>
            )}
            <div className="admin-form-actions">
              <button
                type="submit"
                className="button primary"
                disabled={busy || !categories.length}
              >
                <Save size={16} />
                {busy ? "Сохраняем…" : "Сохранить"}
              </button>
              <button
                type="button"
                className="button secondary"
                onClick={() => setPreview(true)}
              >
                <Eye size={16} /> Предпросмотр
              </button>
            </div>
            <p className="small muted">
              <Check size={13} /> Данные сохраняются в Supabase. Новый промпт
              остаётся черновиком до публикации.
            </p>
          </fieldset>
        </form>
        <aside className="editor-preview">
          <div className="preview-label">
            <Eye size={15} /> Так карточка выглядит в каталоге
          </div>
          <PromptCard
            prompt={card}
            category={categories.find((c) => c.id === category)?.name ?? ""}
            onOpen={() => setPreview(true)}
          />
          <p className="small muted">
            Предпросмотр не публикует промпт. Здесь можно проверить заголовок,
            обложку, описание и полный текст.
          </p>
        </aside>
      </div>
      {preview && (
        <PromptDetail
          prompt={card}
          category={categories.find((c) => c.id === category)?.name ?? ""}
          onClose={() => setPreview(false)}
          preview
        />
      )}
    </div>
  );
}
