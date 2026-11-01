import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FolderPlus,
  LockKeyhole,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { useAdminAuth } from "./useAdminAuth";
import { useCatalog } from "../catalog/CatalogProvider";
import {
  deletePrompt,
  explainError,
  getCategories,
  getPrompts,
  reorderPrompts,
  setPublished,
  withCovers,
} from "../catalog/api";
import type { CatalogPrompt, PromptCategory } from "../catalog/types";
import { PromptDetail } from "../catalog/PromptCard";
import CategoryManager from "./CategoryManager";
import PromptEditor from "./PromptEditor";
export default function AdminPanel() {
  const auth = useAdminAuth();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [signing, setSigning] = useState(false),
    [loginError, setLoginError] = useState("");
  if (!supabaseConfigured)
    return (
      <section className="admin-gate">
        <div className="admin-lock">
          <LockKeyhole size={32} />
        </div>
        <span className="eyebrow accent">ПРОСТРАНСТВО АДМИНИСТРАТОРА</span>
        <h1>Подключим вашу библиотеку.</h1>
        <p>
          Панель управления готова к подключению Supabase.
          <br />
          Для входа и постоянного хранения сначала выполните инструкцию.
        </p>
        <a
          className="button primary"
          href={`${import.meta.env.BASE_URL}supabase-setup.html`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Как подключить Supabase <ArrowUpRight size={16} />
        </a>
        <div className="admin-gate-note">
          <ShieldCheck size={19} />
          <p>
            Доступ к редактированию появится только после входа через Supabase
            Auth и назначения роли администратора. Локального обхода входа нет.
          </p>
        </div>
      </section>
    );
  if (auth.loading && !auth.admin)
    return (
      <div className="loading" role="status">
        <span className="spinner" /> Проверяем доступ…
      </div>
    );
  if (auth.session && !auth.admin)
    return (
      <section className="admin-gate">
        <div className="admin-lock">
          <ShieldCheck size={32} />
        </div>
        <h1>
          {auth.error
            ? "Не удалось проверить доступ"
            : "Доступ только для администратора"}
        </h1>
        <p>
          {auth.error ||
            "Вы вошли в аккаунт без прав управления каталогом. Назначить администратора можно только в настройках базы Supabase."}
        </p>
        <div className="guide-actions">
          {auth.error && (
            <button
              className="button primary"
              onClick={() => void auth.checkRole()}
            >
              <RefreshCw size={15} /> Повторить проверку
            </button>
          )}
          <button
            className="button secondary"
            onClick={() => void supabase!.auth.signOut()}
          >
            Выйти из аккаунта <LogOut size={15} />
          </button>
        </div>
      </section>
    );
  if (!auth.session)
    return (
      <section className="admin-login">
        <div className="admin-login-copy">
          <span className="eyebrow accent">AI PLAYGROUND / СТУДИЯ ИДЕЙ</span>
          <h1>
            Большим идеям
            <br />
            нужен свой пульт.
          </h1>
          <p>
            Управляйте библиотекой промптов DeepSeek:
            <br />
            от первого черновика до новой находки в каталоге.
          </p>
          <div className="admin-login-features">
            <span>
              <Pencil size={17} /> Создавайте и редактируйте
            </span>
            <span>
              <Eye size={17} /> Проверяйте перед публикацией
            </span>
            <span>
              <ShieldCheck size={17} /> Защищайте доступ к коллекции
            </span>
          </div>
        </div>
        <form
          className="panel admin-login-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (signing) return;
            setSigning(true);
            setLoginError("");
            try {
              const { error } = await supabase!.auth.signInWithPassword({
                email: email.trim(),
                password,
              });
              if (error)
                setLoginError(
                  "Не удалось войти. Проверьте email, пароль и подтверждение аккаунта.",
                );
            } catch {
              setLoginError("Сервис входа недоступен. Попробуйте ещё раз.");
            } finally {
              setSigning(false);
              setPassword("");
            }
          }}
        >
          <span className="admin-lock small-lock">
            <LockKeyhole size={23} />
          </span>
          <h2>Вход администратора</h2>
          <p className="muted">
            Используйте аккаунт, созданный в Supabase Auth.
          </p>
          <fieldset disabled={signing}>
            <label>
              Email
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Пароль
              <input
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {loginError && (
              <div className="admin-error" role="alert">
                {loginError}
              </div>
            )}
            <button className="button primary wide" type="submit">
              <LockKeyhole size={16} />
              {signing ? "Входим…" : "Войти"}
            </button>
          </fieldset>
          <p className="small muted">
            Самостоятельная регистрация не предусмотрена. Права проверяются на
            сервере.
          </p>
        </form>
      </section>
    );
  return (
    <AdminWorkspace
      onLogout={async () => {
        await supabase!.auth.signOut();
      }}
    />
  );
}
function AdminWorkspace({ onLogout }: { onLogout: () => Promise<void> }) {
  const catalog = useCatalog();
  const [prompts, setPrompts] = useState<CatalogPrompt[]>([]),
    [categories, setCategories] = useState<PromptCategory[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [editor, setEditor] = useState<CatalogPrompt | null | undefined>(undefined),
    [categoryOpen, setCategoryOpen] = useState(false),
    [preview, setPreview] = useState<CatalogPrompt | null>(null),
    [deleting, setDeleting] = useState<CatalogPrompt | null>(null),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all");
  const load = useCallback(async () => {
    const [data, cats] = await Promise.all([getPrompts(), getCategories()]);
    setPrompts(await withCovers(data));
    setCategories(cats);
  }, []);
  useEffect(() => {
    let live = true;
    void load()
      .catch((e) => {
        if (live) setError(explainError(e));
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [load]);
  const refresh = async () => {
    await load();
    await catalog.refresh();
  };
  const run = async (action: () => Promise<unknown>, success: string) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await action();
      setNotice(typeof result === "string" ? result : success);
      try {
        await refresh();
      } catch (e) {
        setError(
          "Изменение сохранено, но список не удалось обновить. Нажмите «Обновить».",
        );
      }
    } catch (e) {
      setError(explainError(e));
    } finally {
      setBusy(false);
    }
  };
  const move = (id: string, direction: number) => {
    const index = prompts.findIndex((p) => p.id === id);
    const next = [...prompts];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    void run(
      () => reorderPrompts(next.map((p) => p.id)),
      "Порядок карточек сохранён.",
    );
  };
  const list = prompts.filter(
    (p) =>
      (filter === "all" || p.published === (filter === "published")) &&
      `${p.title} ${p.tags.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  if (editor !== undefined)
    return (
      <PromptEditor
        prompt={editor}
        categories={categories}
        onBack={() => setEditor(undefined)}
        onSave={async (warning) => {
          setEditor(undefined);
          setNotice(
            warning
              ? "Промпт сохранён. Старую обложку не удалось удалить из Storage; её можно удалить позже в Supabase."
              : "Промпт сохранён.",
          );
          try {
            await refresh();
          } catch {
            setError(
              "Промпт сохранён, но список не обновился. Нажмите «Обновить».",
            );
          }
        }}
      />
    );
  return (
    <section className="admin-workspace">
      <div className="admin-section-heading">
        <div>
          <span className="eyebrow accent">СТУДИЯ ИДЕЙ / DEEPSEEK</span>
          <h1>Админ-панель</h1>
          <p className="muted">
            Ваша библиотека — от черновика до вдохновения.
          </p>
        </div>
        <div className="admin-heading-actions">
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => setCategoryOpen(true)}
          >
            <FolderPlus size={16} /> Категории
          </button>
          <button
            className="button primary"
            disabled={loading || busy || (Boolean(error) && !prompts.length)}
            onClick={() => {
              if (!categories.length) {
                setCategoryOpen(true);
                setNotice("Сначала создайте категорию для нового промпта.");
              } else setEditor(null);
            }}
          >
            <Plus size={17} /> Создать промпт
          </button>
          <button
            className="icon-button"
            disabled={busy}
            aria-label="Выйти из админ-панели"
            onClick={() => void onLogout()}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      <div className="admin-stats">
        <div>
          <span>Всего промптов</span>
          <strong>{prompts.length.toString().padStart(2, "0")}</strong>
        </div>
        <div>
          <span>Опубликовано</span>
          <strong className="accent">
            {prompts
              .filter((p) => p.published)
              .length.toString()
              .padStart(2, "0")}
          </strong>
        </div>
        <div>
          <span>Черновики</span>
          <strong>
            {prompts
              .filter((p) => !p.published)
              .length.toString()
              .padStart(2, "0")}
          </strong>
        </div>
        <div>
          <span>Категории</span>
          <strong>{categories.length.toString().padStart(2, "0")}</strong>
        </div>
      </div>
      {notice && (
        <div className="admin-notice" role="status">
          <CheckCircle2 size={17} />
          {notice}
          <button
            className="icon-button"
            aria-label="Скрыть уведомление"
            onClick={() => setNotice("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {error && (
        <div className="admin-error" role="alert">
          {error}
        </div>
      )}
      <div className="admin-list-toolbar">
        <div className="chip-row">
          {[
            { id: "all", name: "Все промпты" },
            { id: "published", name: "Опубликованные" },
            { id: "draft", name: "Черновики" },
          ].map((f) => (
            <button
              key={f.id}
              className={`chip ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.name}
            </button>
          ))}
        </div>
        <div className="admin-list-tools">
          <label className="search-box">
            <Search size={16} />
            <input
              aria-label="Найти промпт в админ-панели"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Название или тег"
            />
          </label>
          <button
            className="icon-button"
            aria-label="Обновить промпты"
            disabled={busy}
            onClick={() => void run(async () => {}, "Список обновлён.")}
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>
      {loading ? (
        <div className="catalog-loading" role="status">
          <span className="spinner" /> Загружаем библиотеку…
        </div>
      ) : !list.length ? (
        <div className="deepseek-empty">
          <span>
            <Pencil size={25} />
          </span>
          <div>
            <h3>
              {search || filter !== "all"
                ? "Ничего не найдено"
                : "Место для первой идеи"}
            </h3>
            <p>
              {search || filter !== "all"
                ? "Измените запрос или фильтр."
                : "Создайте категорию и добавьте первый промпт DeepSeek."}
            </p>
          </div>
        </div>
      ) : (
        <div className="admin-prompt-list">
          {list.map((p) => {
            const index = prompts.findIndex((v) => v.id === p.id);
            return (
              <article className="admin-prompt-row" key={p.id}>
                <div className="admin-row-cover">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt="" />
                  ) : (
                    <Pencil size={22} />
                  )}
                </div>
                <div className="admin-row-info">
                  <span>
                    {categories.find((c) => c.id === p.category_id)?.name}
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <span
                    className={`admin-status ${p.published ? "published" : "draft"}`}
                  >
                    {p.published ? "Опубликован" : "Черновик"}
                  </span>
                </div>
                <div className="admin-row-actions">
                  <div className="admin-order">
                    <button
                      className="icon-button"
                      aria-label={`Поднять промпт ${p.title}`}
                      disabled={busy || index === 0}
                      onClick={() => move(p.id, -1)}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <span>{index + 1}</span>
                    <button
                      className="icon-button"
                      aria-label={`Опустить промпт ${p.title}`}
                      disabled={busy || index === prompts.length - 1}
                      onClick={() => move(p.id, 1)}
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={`Предпросмотр ${p.title}`}
                    disabled={busy}
                    onClick={() => setPreview(p)}
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    className="button secondary"
                    aria-label={`Редактировать ${p.title}`}
                    disabled={busy}
                    onClick={() => setEditor(p)}
                  >
                    <Pencil size={14} /> Редактировать
                  </button>
                  <button
                    className={`button ${p.published ? "secondary" : "primary"}`}
                    aria-label={`${p.published ? "Снять с публикации" : "Опубликовать"} ${p.title}`}
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => setPublished(p, !p.published),
                        p.published
                          ? "Промпт снят с публикации."
                          : "Промпт опубликован и добавлен в общий каталог.",
                      )
                    }
                  >
                    {p.published ? <EyeOff size={14} /> : <Eye size={14} />}{" "}
                    {p.published ? "Снять с публикации" : "Опубликовать"}
                  </button>
                  <button
                    className="icon-button danger"
                    aria-label={`Удалить промпт ${p.title}`}
                    disabled={busy}
                    onClick={() => setDeleting(p)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="admin-order-hint">
        Стрелки меняют общий порядок карточек. Черновики видны только
        администраторам.
      </p>
      {categoryOpen && (
        <CategoryManager
          categories={categories}
          onChange={refresh}
          onClose={() => setCategoryOpen(false)}
        />
      )}
      {preview && (
        <PromptDetail
          prompt={preview}
          category={
            categories.find((c) => c.id === preview.category_id)?.name ?? ""
          }
          onClose={() => setPreview(null)}
          preview
        />
      )}
      {deleting && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <section
            className="modal delete-prompt-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Подтверждение удаления промпта"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button close"
              aria-label="Закрыть"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              <X size={20} />
            </button>
            <Trash2 size={29} />
            <h2>Удалить промпт?</h2>
            <p className="muted">
              «{deleting.title}» будет удалён из библиотеки и каталога. Это
              действие нельзя отменить.
            </p>
            <div className="detail-actions">
              <button
                className="button danger-button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const cleaned = await deletePrompt(deleting);
                    setDeleting(null);
                    return cleaned
                      ? "Промпт удалён."
                      : "Промпт удалён, но обложка осталась в Storage. Её можно удалить в Supabase.";
                  }, "Промпт удалён.")
                }
              >
                Удалить навсегда
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => setDeleting(null)}
              >
                Отмена
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
