import { useState } from "react";
import { Check, Copy, Sparkles, X, WandSparkles } from "lucide-react";
import { projects, type ProjectId } from "../data";
import { useStored } from "../hooks";
export function PromptBuilder({
  initial = "case",
  onClose,
}: {
  initial?: ProjectId;
  onClose: () => void;
}) {
  const [id, setId] = useState<ProjectId>(initial);
  const [theme, setTheme] = useStored("prompt-theme", "Космос");
  const [level, setLevel] = useState("Начинающий");
  const [feature, setFeature] = useState("");
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copy = async () => {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      const field = document.querySelector<HTMLTextAreaElement>(
        ".prompt-result textarea",
      );
      field?.focus();
      field?.select();
      const ok = document.execCommand("copy");
      setCopied(ok);
      setCopyError(!ok);
    }
  };
  const generate = () => {
    const p = projects.find((p) => p.id === id)!;
    setCopied(false);
    setPrompt(
      `Создай интерактивный проект «${p.title}» для детей. Тема оформления: ${theme}. Уровень ученика: ${level}. Используй React, TypeScript и CSS. ${id === "case" ? "Добавь анимированное открытие кейса, виртуальные очки и коллекцию. Только бесплатная игра без покупок и денежных ставок." : id === "car" ? "Добавь оптимизированную 3D-модель автомобиля, вращение, выбор цвета, дисков и подсветки." : id === "market" ? "Добавь каталог товаров, поиск, фильтры, корзину и демонстрационное оформление заказа без оплаты и личных данных." : "Добавь редактор комнаты, цвет стен, перетаскивание и вращение мебели, сохранение дизайна."} Сохраняй прогресс в localStorage. Сделай адаптивный русский интерфейс и доступное управление с клавиатуры.${feature ? ` Дополнительная идея: ${feature}.` : ""} Объясни устройство проекта и предложи 3 задания для самостоятельного развития.`,
    );
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal prompt-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Создай свою версию"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon-button close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>
        <div className="modal-symbol">
          <WandSparkles size={25} />
        </div>
        <span className="eyebrow">ОТ ИДЕИ К ПЕРВОМУ ПРОЕКТУ</span>
        <h2>А что создашь ты?</h2>
        <p className="muted">
          Настрой идею и получи готовый промпт для своего ИИ-помощника.
        </p>
        <div className="form-grid">
          <label>
            Основа проекта
            <select
              value={id}
              onChange={(e) => {
                setId(e.target.value as ProjectId);
                setPrompt("");
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Твой уровень
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option>Начинающий</option>
              <option>Уже пробовал</option>
              <option>Уверенный создатель</option>
            </select>
          </label>
          <label>
            Стиль и атмосфера
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option>Космос</option>
              <option>Киберпанк</option>
              <option>Мир природы</option>
              <option>Пастельный минимализм</option>
              <option>Пиксельная вселенная</option>
            </select>
          </label>
          <label>
            Своя идея
            <input
              value={feature}
              maxLength={180}
              onChange={(e) => setFeature(e.target.value)}
              placeholder="Например, режим дня и ночи"
            />
          </label>
        </div>
        <button className="button primary wide" onClick={generate}>
          <Sparkles size={17} /> Сгенерировать промпт
        </button>
        {prompt && (
          <div className="prompt-result">
            <label>
              Твой промпт
              <textarea
                aria-label="Твой промпт"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setCopied(false);
                }}
                rows={7}
              />
            </label>
            <button className="button secondary" onClick={copy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
              {copied ? "Скопировано" : "Копировать"}
            </button>
            <small role="status">
              {copyError
                ? "Текст выделен. Нажми Ctrl+C (или ⌘C), чтобы скопировать."
                : copied
                  ? "Промпт скопирован! Вставь его в своего ИИ-помощника."
                  : "Вставь текст в ChatGPT или другого ИИ-помощника. Здесь промпт создаётся локально."}
            </small>
          </div>
        )}
      </section>
    </div>
  );
}
