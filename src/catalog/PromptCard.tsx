import { ArrowUpRight, Copy, Check, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { CatalogPrompt } from "./types";
export function PromptCard({
  prompt,
  category,
  onOpen,
}: {
  prompt: CatalogPrompt;
  category: string;
  onOpen: () => void;
}) {
  return (
    <article className="prompt-card">
      <button
        className="prompt-cover"
        onClick={onOpen}
        aria-label={`Открыть промпт ${prompt.title}`}
      >
        {prompt.cover_url ? (
          <img
            src={prompt.cover_url}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
        ) : (
          <div className="prompt-cover-pattern">
            <Sparkles size={37} />
            <span>DEEPSEEK / IDEAS LAB</span>
          </div>
        )}
        <span className="prompt-model">DeepSeek</span>
        <span className="prompt-cover-arrow">
          <ArrowUpRight size={19} />
        </span>
      </button>
      <div className="prompt-card-body">
        <span className="prompt-category-name">
          {category || "Без категории"}
        </span>
        <h3>
          <button onClick={onOpen}>{prompt.title || "Название промпта"}</button>
        </h3>
        <p>
          {prompt.description ||
            "Кратко расскажите, что поможет создать этот промпт."}
        </p>
        <div className="prompt-tags">
          {prompt.tags.slice(0, 4).map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
        <button className="prompt-read" onClick={onOpen}>
          Открыть промпт <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}
export function PromptDetail({
  prompt,
  category,
  onClose,
  preview = false,
}: {
  prompt: CatalogPrompt;
  category: string;
  onClose: () => void;
  preview?: boolean;
}) {
  const [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false);
  const copy = async () => {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
    } catch {
      const area = document.querySelector<HTMLTextAreaElement>(
        ".deepseek-copy-text",
      );
      area?.focus();
      area?.select();
      const success = document.execCommand("copy");
      setCopied(success);
      setCopyError(!success);
    }
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal deepseek-detail"
        role="dialog"
        aria-modal="true"
        aria-label={preview ? "Предпросмотр промпта" : prompt.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon-button close"
          aria-label="Закрыть"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <span className="eyebrow accent">
          {preview ? "ПРЕДПРОСМОТР · " : ""}DEEPSEEK / {category}
        </span>
        <h2>{prompt.title || "Новый промпт"}</h2>
        <p className="muted">{prompt.description}</p>
        <div className="prompt-tags">
          {prompt.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
        <label>
          Полный текст промпта
          <textarea
            className="deepseek-copy-text"
            readOnly
            aria-label="Полный текст промпта"
            value={prompt.content}
            rows={12}
          />
        </label>
        <div className="detail-actions">
          <button
            className="button primary"
            disabled={!prompt.content.trim()}
            onClick={copy}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
            {copied ? "Скопировано" : "Копировать промпт"}
          </button>
          <a
            className="button secondary"
            href="https://chat.deepseek.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Открыть DeepSeek <ArrowUpRight size={15} />
          </a>
        </div>
        <p role="status" className="small muted">
          {copyError
            ? "Текст выделен. Скопируйте его сочетанием Ctrl+C или ⌘C."
            : "Скопируй промпт и вставь в DeepSeek. Перед отправкой проверь, что в нём нет личных данных."}
        </p>
      </section>
    </div>
  );
}
