import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Plus, Trash2, X } from "lucide-react";
import type { PromptCategory } from "../catalog/types";
import {
  createCategory,
  deleteCategory,
  explainError,
  renameCategory,
  reorderCategories,
} from "../catalog/api";
export default function CategoryManager({
  categories,
  onChange,
  onClose,
}: {
  categories: PromptCategory[];
  onChange: () => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(""),
    [editing, setEditing] = useState<string | null>(null),
    [editName, setEditName] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const run = async (action: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
      await onChange();
      setName("");
      setEditing(null);
      setConfirmDelete(null);
    } catch (e) {
      setError(explainError(e));
    } finally {
      setBusy(false);
    }
  };
  const move = (index: number, direction: number) => {
    const next = [...categories];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    void run(() => reorderCategories(next.map((c) => c.id)));
  };
  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <section
        className="modal category-manager"
        role="dialog"
        aria-modal="true"
        aria-label="Управление категориями"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon-button close"
          aria-label="Закрыть"
          disabled={busy}
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <span className="eyebrow accent">СТРУКТУРА КАТАЛОГА</span>
        <h2>Категории</h2>
        <p className="muted">
          Создавайте разделы и задавайте порядок фильтров. Категорию с промптами
          удалить нельзя.
        </p>
        <form
          className="new-category-form"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => createCategory(name));
          }}
        >
          <label>
            Новая категория
            <input
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Учёба и открытия"
            />
          </label>
          <button className="button primary" disabled={busy || !name.trim()}>
            <Plus size={15} /> Добавить
          </button>
        </form>
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
        <div className="category-list">
          {categories.map((c, index) => (
            <div className="category-edit-row" key={c.id}>
              {editing === c.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void run(() => renameCategory(c, editName));
                  }}
                >
                  <input
                    aria-label={`Название категории ${c.name}`}
                    required
                    maxLength={80}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <button
                    className="icon-button"
                    aria-label={`Сохранить категорию ${c.name}`}
                    disabled={busy || !editName.trim()}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Отменить переименование"
                    onClick={() => setEditing(null)}
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <>
                  <button
                    className="category-rename"
                    disabled={busy}
                    onClick={() => {
                      setEditing(c.id);
                      setEditName(c.name);
                    }}
                  >
                    {c.name}
                    <small>Нажмите, чтобы переименовать</small>
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Поднять категорию ${c.name}`}
                    disabled={busy || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Опустить категорию ${c.name}`}
                    disabled={busy || index === categories.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    className="icon-button danger"
                    aria-label={`Удалить категорию ${c.name}`}
                    disabled={busy}
                    onClick={() =>
                      setConfirmDelete(confirmDelete === c.id ? null : c.id)
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
              {confirmDelete === c.id && (
                <div className="category-delete-confirm">
                  <span>Удалить «{c.name}»?</span>
                  <button
                    className="button danger-button"
                    disabled={busy}
                    onClick={() => void run(() => deleteCategory(c.id))}
                  >
                    Да, удалить
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setConfirmDelete(null)}
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {!categories.length && (
          <p className="small muted">
            Пока нет категорий. Создайте первую, чтобы добавить промпт.
          </p>
        )}
      </section>
    </div>
  );
}
