import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Box,
  ChevronDown,
  ChevronRight,
  Code2,
  Compass,
  Gamepad2,
  Grid2X2,
  Heart,
  Layers3,
  Lightbulb,
  Menu,
  MousePointer2,
  Palette,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
  X,
  LibraryBig,
  LockKeyhole,
} from "lucide-react";
import { projects, projectById, type ProjectId, type Category } from "./data";
import { useStored } from "./hooks";
import { HeroArt, ProjectArt } from "./components/Artwork";
import { PromptBuilder } from "./components/PromptBuilder";
import PromptCatalog from "./catalog/PromptCatalog";
const AdminPanel = lazy(() => import("./admin/AdminPanel"));
const CaseBattle = lazy(() => import("./projects/CaseBattle"));
const CarStudio = lazy(() => import("./projects/CarStudio"));
const MiniMarket = lazy(() => import("./projects/MiniMarket"));
const DreamRoom = lazy(() => import("./projects/DreamRoom"));
const registry = {
  case: CaseBattle,
  car: CarStudio,
  market: MiniMarket,
  room: DreamRoom,
};
const categories: { title: Category; icon: typeof Grid2X2 }[] = [
  { title: "Все проекты", icon: Grid2X2 },
  { title: "Игры", icon: Gamepad2 },
  { title: "3D", icon: Box },
  { title: "Сайты", icon: Code2 },
  { title: "Творчество", icon: Palette },
];
function readRoute() {
  return projectById(location.hash.slice(1))?.id ?? null;
}
type View = "catalog" | "saved" | "guide" | "prompts" | "admin";
function readSection(): View | null {
  const hash = location.hash.slice(1);
  return hash === "admin" || hash === "prompts" ? hash : null;
}
export default function App() {
  const [active, setActive] = useState<ProjectId | null>(readRoute);
  const [category, setCategory] = useState<Category>("Все проекты");
  const [view, setView] = useState<View>(() => readSection() ?? "catalog");
  const [search, setSearch] = useState("");
  const [age, setAge] = useState("all");
  const [level, setLevel] = useState("all");
  const [favorites, setFavorites] = useStored<ProjectId[]>("favorites", []);
  const [visited, setVisited] = useStored<ProjectId[]>("visited", []);
  const [prompt, setPrompt] = useState<ProjectId | false>(false);
  const [settings, setSettings] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useStored("reduce-motion", false);
  useEffect(() => {
    const f = () => {
      setActive(readRoute());
      const section = readSection();
      if (section) setView(section);
      else setView((v) => (v === "admin" || v === "prompts" ? "catalog" : v));
    };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);
  useEffect(() => {
    if (active) setVisited((v) => (v.includes(active) ? v : [...v, active]));
  }, [active, setVisited]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPrompt(false);
        setSettings(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const open = (id: ProjectId) => {
    location.hash = id;
    setActive(id);
    setVisited((v) => (v.includes(id) ? v : [...v, id]));
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const back = () => {
    history.replaceState(null, "", location.pathname + location.search);
    setActive(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const navigate = (v: typeof view) => {
    back();
    setView(v);
    if (v === "admin" || v === "prompts") location.hash = v;
    setMobile(false);
  };
  const toggleFavorite = (id: ProjectId) =>
    setFavorites((f) =>
      f.includes(id) ? f.filter((i) => i !== id) : [...f, id],
    );
  const visible = projects.filter(
    (p) =>
      (category === "Все проекты" || p.category === category) &&
      (view !== "saved" || favorites.includes(p.id)) &&
      (age === "all" || p.age <= Number(age)) &&
      (level === "all" || p.level === level) &&
      `${p.title} ${p.description} ${p.category}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const current = active ? projectById(active) : undefined;
  const Current = active ? registry[active] : null;
  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${mobile ? "visible" : ""}`}
        onClick={() => setMobile(false)}
      />
      <aside className={`sidebar ${mobile ? "is-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("catalog");
          }}
        >
          <span className="brand-mark">
            <Layers3 size={26} strokeWidth={2.5} />
          </span>
          <span>
            AI PLAYGROUND
            <span className="brand-sub">ПРОСТРАНСТВО ВОЗМОЖНОСТЕЙ</span>
          </span>
        </a>
        <div className="workspace-label">
          ТВОЯ ЛАБОРАТОРИЯ <span>✦</span>
        </div>
        <nav className="main-nav" aria-label="Главная навигация">
          <button
            className={view === "catalog" && !active ? "selected" : ""}
            onClick={() => navigate("catalog")}
          >
            <Compass size={19} /> Обзор проектов{" "}
            <span className="nav-count">4</span>
          </button>
          <button
            className={view === "prompts" && !active ? "selected" : ""}
            onClick={() => navigate("prompts")}
          >
            <LibraryBig size={18} /> Промпты DeepSeek
          </button>
          <button
            className={view === "saved" && !active ? "selected" : ""}
            onClick={() => navigate("saved")}
          >
            <Bookmark size={18} /> Избранное{" "}
            {favorites.length > 0 && (
              <span className="nav-count">{favorites.length}</span>
            )}
          </button>
          <button
            className={view === "guide" && !active ? "selected" : ""}
            onClick={() => navigate("guide")}
          >
            <Lightbulb size={19} /> Как это работает{" "}
            <span className="tiny-dot" />
          </button>
        </nav>
        <div className="side-divider" />
        <div className="workspace-label">ИССЛЕДУЙ</div>
        <nav className="category-nav" aria-label="Категории">
          {categories.slice(1).map(({ title, icon: Icon }) => (
            <button
              className={
                category === title && view === "catalog" && !active
                  ? "category-active"
                  : ""
              }
              key={title}
              onClick={() => {
                navigate("catalog");
                setCategory(title);
              }}
            >
              <Icon size={18} />
              {title}
              <ChevronRight size={14} />
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="idea-card">
            <span className="idea-icon">
              <WandSparkles size={21} />
            </span>
            <h3>
              Большие идеи
              <br />
              начинаются с «а что, если?»
            </h3>
            <p>
              Сделай первый шаг.
              <br />
              Создай что-то своё с ИИ.
            </p>
            <button onClick={() => setPrompt("case")}>
              Попробовать <ArrowUpRightSmall />
            </button>
          </div>
          <button className="settings-link" onClick={() => setSettings(true)}>
            <Settings2 size={18} /> Настройки <span>⌘</span>
          </button>
          <button
            className="admin-nav-link"
            onClick={() => navigate("admin")}
            aria-current={view === "admin" ? "page" : undefined}
          >
            <LockKeyhole size={16} /> Админ-панель
          </button>
          <div className="sidebar-footer">
            <span className="status-dot" /> Можно всё. Начни с малого.
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Открыть меню"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <span>Лаборатория</span>
            <ChevronRight size={14} />
            <strong>
              {current?.title ??
                (view === "saved"
                  ? "Избранное"
                  : view === "guide"
                    ? "Как это работает"
                    : view === "admin"
                      ? "Админ-панель"
                      : view === "prompts"
                        ? "Промпты DeepSeek"
                        : "Обзор проектов")}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="live-label">
              <span className="status-dot" /> Создано с помощью ИИ
            </span>
            <div className="top-divider" />
            <button
              className="profile-button"
              onClick={() => setSettings(true)}
              aria-label="Настройки исследователя"
            >
              И<span />
            </button>
          </div>
        </header>
        <main>
          {Current && current ? (
            <>
              <div className="project-heading">
                <button className="back-button" onClick={back}>
                  <ArrowLeft size={16} /> К каталогу
                </button>
                <div className="project-heading-row">
                  <div>
                    <span className="eyebrow" style={{ color: current.color }}>
                      {current.category} / ИНТЕРАКТИВНЫЙ ПРОЕКТ
                    </span>
                    <h1>{current.title}</h1>
                    <p className="muted">{current.description}</p>
                  </div>
                  <button
                    className="button secondary"
                    onClick={() => setPrompt(current.id)}
                  >
                    <WandSparkles size={17} /> Создай свою версию
                  </button>
                </div>
              </div>
              <Suspense
                fallback={
                  <div className="loading">
                    <span className="spinner" />
                    Загружаем твою лабораторию…
                  </div>
                }
              >
                <Current />
              </Suspense>
              <div className="project-create">
                <Sparkles size={23} />
                <div>
                  <h3>Это только начало. Добавь свою идею.</h3>
                  <p>
                    Измени стиль, придумай новые возможности и создай свою
                    версию с ИИ.
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => setPrompt(current.id)}
                >
                  Собрать промпт <ArrowRight size={16} />
                </button>
              </div>
            </>
          ) : view === "admin" ? (
            <Suspense
              fallback={
                <div className="loading">
                  <span className="spinner" />
                  Открываем панель…
                </div>
              }
            >
              <AdminPanel />
            </Suspense>
          ) : view === "prompts" ? (
            <PromptCatalog onCreate={() => setPrompt("case")} />
          ) : view === "guide" ? (
            <Guide
              onPrompt={() => setPrompt("case")}
              onExplore={() => navigate("catalog")}
            />
          ) : (
            <>
              {view === "catalog" && (
                <section className="hero">
                  <div className="hero-copy">
                    <div className="hero-badge">
                      <span /> МЕСТО, ГДЕ ИДЕИ ОЖИВАЮТ <Sparkles size={12} />
                    </div>
                    <h1>
                      Не просто смотри.
                      <br />
                      <span>Создавай.</span> Играй.
                      <br />
                      Открывай новое.
                    </h1>
                    <p>
                      Исследуй, на что способен искусственный интеллект.
                      <br className="desktop-br" /> Настоящие проекты, которые
                      можно потрогать.
                      <br className="desktop-br" /> И идеи, которые могут стать
                      твоими.
                    </p>
                    <div className="hero-actions">
                      <button
                        className="button primary"
                        onClick={() =>
                          document.getElementById("catalog")?.scrollIntoView({
                            behavior: reduced ? "instant" : "smooth",
                          })
                        }
                      >
                        Исследовать проекты <ArrowDown size={17} />
                      </button>
                      <button
                        className="hero-how"
                        onClick={() => setView("guide")}
                      >
                        <span className="play-icon" aria-hidden="true">
                          ▸
                        </span>{" "}
                        Как это работает
                      </button>
                    </div>
                    <div className="hero-proof">
                      <div className="avatar-stack">
                        <span>✳</span>
                        <span>◉</span>
                        <span>✦</span>
                        <span>☺</span>
                      </div>
                      <span>
                        Для любопытных <strong>от 7 до 17 лет</strong>
                      </span>
                    </div>
                  </div>
                  <div className="hero-visual">
                    <HeroArt />
                    <span className="art-caption">
                      <span /> Твоя фантазия + возможности ИИ
                    </span>
                  </div>
                </section>
              )}
              <section className="catalog-section" id="catalog">
                <div className="section-title">
                  <div>
                    <div className="section-eyebrow">
                      <span /> ВЫБИРАЙ. ПРОБУЙ. ВДОХНОВЛЯЙСЯ.
                    </div>
                    <h2>
                      {view === "saved"
                        ? "Твоя коллекция идей"
                        : "Твоя следующая идея"}{" "}
                      <span>{view === "saved" ? favorites.length : "04"}</span>
                    </h2>
                    <p>
                      {view === "saved"
                        ? "Проекты, к которым хочется вернуться."
                        : "Четыре проекта. Бесконечно много возможностей."}
                    </p>
                  </div>
                  <label className="search-box">
                    <Search size={17} />
                    <input
                      aria-label="Поиск проектов"
                      placeholder="Найти что-нибудь интересное"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        aria-label="Очистить поиск"
                        onClick={() => setSearch("")}
                      >
                        <X size={14} />
                      </button>
                    )}
                    <span>⌕</span>
                  </label>
                </div>
                <div className="filterbar">
                  <div
                    className="category-tabs"
                    role="group"
                    aria-label="Категория проекта"
                  >
                    {categories.map(({ title, icon: Icon }) => (
                      <button
                        key={title}
                        className={category === title ? "active" : ""}
                        onClick={() => setCategory(title)}
                      >
                        <Icon size={15} />
                        {title}
                      </button>
                    ))}
                  </div>
                  <div className="select-filters">
                    <SlidersHorizontal size={16} />
                    <label>
                      <span className="sr-only">Возраст</span>
                      <select
                        aria-label="Возраст"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      >
                        <option value="all">Любой возраст</option>
                        <option value="7">7–9 лет</option>
                        <option value="10">10–13 лет</option>
                        <option value="17">14–17 лет</option>
                      </select>
                      <ChevronDown size={12} />
                    </label>
                    <label>
                      <span className="sr-only">Сложность</span>
                      <select
                        aria-label="Сложность"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                      >
                        <option value="all">Любая сложность</option>
                        <option>Легко</option>
                        <option>Средне</option>
                      </select>
                      <ChevronDown size={12} />
                    </label>
                  </div>
                </div>
                <div className="project-grid">
                  {visible.map((p, i) => (
                    <article
                      className={`project-card card-${p.id}`}
                      key={p.id}
                      style={{ animationDelay: `${i * 65}ms` }}
                    >
                      <div className="card-art">
                        <button
                          className="art-link"
                          onClick={() => open(p.id)}
                          aria-label={`Открыть ${p.title}`}
                        >
                          <ProjectArt id={p.id} />
                        </button>
                        <span className="art-tag" style={{ color: p.color }}>
                          <span />
                          {p.tag}
                        </span>
                        <button
                          className={`favorite-button ${favorites.includes(p.id) ? "is-favorite" : ""}`}
                          aria-pressed={favorites.includes(p.id)}
                          aria-label={`${favorites.includes(p.id) ? "Убрать из избранного" : "В избранное"} ${p.title}`}
                          onClick={() => toggleFavorite(p.id)}
                        >
                          <Bookmark
                            size={16}
                            fill={
                              favorites.includes(p.id) ? "currentColor" : "none"
                            }
                          />
                        </button>
                      </div>
                      <div className="card-content">
                        <div
                          className="card-category"
                          style={{ color: p.color }}
                        >
                          {p.category}
                          <span>
                            {visited.includes(p.id)
                              ? "Уже исследован"
                              : "Интерактивный проект"}
                          </span>
                        </div>
                        <h3>
                          <button onClick={() => open(p.id)}>{p.title}</button>
                        </h3>
                        <p>{p.description}</p>
                        <div className="card-meta">
                          <span>
                            <span
                              className={`difficulty ${p.level === "Средне" ? "medium" : ""}`}
                            >
                              <i />
                              <i />
                              <i />
                            </span>
                            {p.level}
                          </span>
                          <span className="meta-dot">·</span>
                          <span>{p.age}–17 лет</span>
                          <span className="free-label">Бесплатно</span>
                        </div>
                        <button
                          className="card-launch"
                          onClick={() => open(p.id)}
                        >
                          Открыть проект <ArrowRight size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {!visible.length && (
                  <div className="empty-state">
                    <Search size={32} />
                    <h3>
                      {view === "saved"
                        ? "Здесь будут твои любимые проекты"
                        : "Пока ничего не нашли"}
                    </h3>
                    <p>
                      Попробуй изменить фильтры или сохрани проект кнопкой
                      закладки.
                    </p>
                    <button
                      className="button secondary"
                      onClick={() => {
                        setSearch("");
                        setCategory("Все проекты");
                        setAge("all");
                        setLevel("all");
                        if (view === "saved") setView("catalog");
                      }}
                    >
                      Показать все проекты
                    </button>
                  </div>
                )}
              </section>
              {view === "catalog" && (
                <PromptCatalog
                  compact
                  onExplore={() => navigate("prompts")}
                  onCreate={() => setPrompt("case")}
                />
              )}
              <section className="create-banner">
                <div className="banner-icon">
                  <WandSparkles size={28} />
                  <span>✦</span>
                </div>
                <div className="banner-copy">
                  <div className="section-eyebrow">СЛЕДУЮЩИЙ ПРОЕКТ — ТВОЙ</div>
                  <h2>Из «прикольно» в «я тоже так могу».</h2>
                  <p>
                    Выбери идею, добавь свой стиль — и создай свою версию с
                    помощью ИИ.
                  </p>
                </div>
                <button
                  className="button light"
                  onClick={() => setPrompt("case")}
                >
                  Хочу создать своё <ArrowRight size={16} />
                </button>
              </section>
              <div className="trust-row">
                <span>
                  <ShieldCheck size={16} /> Без регистраций и настоящих денег
                </span>
                <span>
                  <MousePointer2 size={16} /> Всё можно попробовать
                </span>
                <span>
                  <Heart size={16} /> Создано для любопытных
                </span>
              </div>
            </>
          )}
        </main>
        <footer className="page-footer">
          <span>© 2026 AI PLAYGROUND</span>
          <span>
            Маленькие эксперименты. Большие открытия.{" "}
            <span className="footer-star">✳</span>
          </span>
          <button
            onClick={() => {
              setView("guide");
              back();
              window.scrollTo({ top: 0 });
            }}
          >
            Об этом пространстве <ArrowUpRightSmall />
          </button>
        </footer>
      </div>
      {prompt && (
        <PromptBuilder initial={prompt} onClose={() => setPrompt(false)} />
      )}
      {settings && (
        <div className="modal-backdrop" onClick={() => setSettings(false)}>
          <section
            className="modal settings-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Настройки"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button close"
              aria-label="Закрыть"
              onClick={() => setSettings(false)}
            >
              <X size={20} />
            </button>
            <Settings2 className="accent" size={28} />
            <h2>Твоя лаборатория</h2>
            <p className="muted">Всё сохраняется только в этом браузере.</p>
            <label className="toggle-row">
              Уменьшить анимации
              <input
                type="checkbox"
                checked={reduced}
                onChange={(e) => setReduced(e.target.checked)}
              />
            </label>
            <div className="progress-stat">
              <strong>{visited.length} / 4</strong>
              <span>проектов исследовано</span>
            </div>
            <p className="small muted">
              Без аккаунтов и личных данных. Виртуальные монеты и тестовые
              заказы не имеют денежной стоимости.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
function ArrowUpRightSmall() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
function Guide({
  onPrompt,
  onExplore,
}: {
  onPrompt: () => void;
  onExplore: () => void;
}) {
  return (
    <section className="guide">
      <div className="hero-badge">
        <Sparkles size={14} /> ТВОЙ ПУТЬ ОТ ИДЕИ К ПРОЕКТУ
      </div>
      <h1>
        Любопытство —<br />
        <span className="accent">твоя суперсила.</span>
      </h1>
      <p className="muted">
        Здесь можно разобрать большую идею на маленькие эксперименты.
        <br />А потом придумать что-то совершенно своё.
      </p>
      <div className="guide-grid">
        {[
          {
            icon: Compass,
            title: "01. Исследуй",
            text: "Открой любой из четырёх проектов. Крути автомобиль, расставляй мебель, собирай коллекцию — здесь всё работает.",
          },
          {
            icon: SlidersHorizontal,
            title: "02. Экспериментируй",
            text: "Меняй настройки и следи за результатом. Что будет, если выбрать другие колёса? А если перекрасить комнату?",
          },
          {
            icon: WandSparkles,
            title: "03. Создавай",
            text: "Нажми «Создай свою версию». Собери промпт, скопируй его в ИИ-помощник и начни свой проект.",
          },
        ].map((s) => (
          <article key={s.title}>
            <s.icon size={28} />
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </article>
        ))}
      </div>
      <div className="guide-actions">
        <button className="button primary" onClick={onExplore}>
          К проектам <ArrowRight size={16} />
        </button>
        <button className="button secondary" onClick={onPrompt}>
          Собрать первый промпт <Sparkles size={16} />
        </button>
      </div>
      <div className="info-note">
        <ShieldCheck size={22} />
        <p>
          Все проекты работают без регистрации. Здесь нет платежей и настоящих
          денег. Данные сохраняются на твоём устройстве. Генератор промптов не
          отправляет данные в ИИ.
        </p>
      </div>
    </section>
  );
}
