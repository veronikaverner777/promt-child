import { useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useCatalog } from "./CatalogProvider";
import { PromptCard, PromptDetail } from "./PromptCard";
import type { CatalogPrompt } from "./types";
export default function PromptCatalog({
  compact = false,
  onExplore,
  onCreate,
}: {
  compact?: boolean;
  onExplore?: () => void;
  onCreate: () => void;
}) {
  const { prompts, categories, loading, error, refresh } = useCatalog();
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("all"),
    [detail, setDetail] = useState<CatalogPrompt | null>(null);
  const visible = prompts.filter(
    (p) =>
      (category === "all" || p.category_id === category) &&
      `${p.title} ${p.description} ${p.tags.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const list = compact ? visible.slice(0, 6) : visible;
  const currentDetail = prompts.find((p) => p.id === detail?.id);
  return (
    <section
      className={`deepseek-catalog ${compact ? "compact" : ""}`}
      aria-label="Каталог промптов DeepSeek"
    >
      <div className="section-title">
        <div>
          <div className="section-eyebrow">
            <span /> ИДЕИ, КОТОРЫЕ МОЖНО ПРОДОЛЖИТЬ
          </div>
          {compact ? (
            <h2>
              Промпты DeepSeek <span>{prompts.length}</span>
            </h2>
          ) : (
            <h1>
              Промпты для больших идей
              <span className="model-badge">DeepSeek</span>
            </h1>
          )}
          <p>Выбери идею, скопируй промпт — и начни создавать.</p>
        </div>
        {compact ? (
          <button className="button secondary" onClick={onExplore}>
            Все промпты <ArrowRight size={15} />
          </button>
        ) : (
          <label className="search-box">
            <Search size={16} />
            <input
              aria-label="Поиск промптов"
              placeholder="Название, описание или тег"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        )}
      </div>
      {!compact && categories.length > 0 && (
        <div className="deepseek-category-tabs">
          <button
            className={`chip ${category === "all" ? "active" : ""}`}
            onClick={() => setCategory("all")}
          >
            Все категории
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`chip ${category === c.id ? "active" : ""}`}
              onClick={() => setCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      {loading ? (
        <div className="catalog-loading" role="status">
          <span className="spinner" /> Загружаем идеи…
        </div>
      ) : error ? (
        <div className="catalog-error" role="alert">
          <p>Не удалось загрузить каталог промптов.</p>
          <button className="button secondary" onClick={() => void refresh()}>
            Повторить загрузку
          </button>
        </div>
      ) : list.length ? (
        <div className="deepseek-grid">
          {list.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              category={
                categories.find((c) => c.id === p.category_id)?.name ?? ""
              }
              onOpen={() => setDetail(p)}
            />
          ))}
        </div>
      ) : (
        <div className="deepseek-empty">
          <span>
            <Sparkles size={24} />
          </span>
          <div>
            <h3>
              {search || category !== "all"
                ? "Пока ничего не нашли"
                : "Здесь скоро появятся новые идеи"}
            </h3>
            <p>
              {search || category !== "all"
                ? "Попробуй другой запрос или категорию."
                : "А пока собери собственный промпт в нашем конструкторе."}
            </p>
          </div>
          <button
            className="button secondary"
            onClick={
              search || category !== "all"
                ? () => {
                    setSearch("");
                    setCategory("all");
                  }
                : onCreate
            }
          >
            {search || category !== "all"
              ? "Сбросить фильтры"
              : "Создать свою идею"}{" "}
            <ArrowRight size={14} />
          </button>
        </div>
      )}
      {currentDetail && (
        <PromptDetail
          prompt={currentDetail}
          category={
            categories.find((c) => c.id === currentDetail.category_id)?.name ??
            ""
          }
          onClose={() => setDetail(null)}
        />
      )}
    </section>
  );
}
