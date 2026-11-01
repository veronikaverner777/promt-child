import { useRef, useState } from "react";
import {
  Armchair,
  Check,
  ChevronDown,
  Copy,
  Grid2X2,
  Layers3,
  Minus,
  MousePointer2,
  Plus,
  RotateCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useStored } from "../hooks";
type Kind =
  "sofa" | "bed" | "desk" | "plant" | "rug" | "table" | "shelf" | "chair";
type Furniture = {
  id: string;
  kind: Kind;
  x: number;
  y: number;
  rotation: number;
};
type Design = { wall: string; floor: string; furniture: Furniture[] };
type Snapshot = { id: string; name: string; design: Design };
const kinds: { kind: Kind; name: string; w: number; h: number }[] = [
  { kind: "sofa", name: "Диван", w: 33, h: 18 },
  { kind: "bed", name: "Кровать", w: 29, h: 40 },
  { kind: "desk", name: "Рабочий стол", w: 30, h: 15 },
  { kind: "plant", name: "Растение", w: 12, h: 12 },
  { kind: "rug", name: "Ковёр", w: 40, h: 30 },
  { kind: "table", name: "Кофейный стол", w: 20, h: 20 },
  { kind: "shelf", name: "Стеллаж", w: 26, h: 10 },
  { kind: "chair", name: "Кресло", w: 17, h: 18 },
];
const initial: Design = {
  wall: "#acb9a0",
  floor: "oak",
  furniture: [
    { id: "rug-1", kind: "rug", x: 51, y: 53, rotation: 0 },
    { id: "sofa-1", kind: "sofa", x: 49, y: 24, rotation: 0 },
    { id: "desk-1", kind: "desk", x: 20, y: 70, rotation: 90 },
    { id: "plant-1", kind: "plant", x: 84, y: 19, rotation: 0 },
    { id: "table-1", kind: "table", x: 51, y: 54, rotation: 0 },
    { id: "chair-1", kind: "chair", x: 77, y: 67, rotation: 270 },
  ],
};
function clampPiece(p: Furniture) {
  const k = kinds.find((k) => k.kind === p.kind)!;
  const rotated = p.rotation % 180 !== 0;
  const hw = (rotated ? k.h : k.w) / 2 + 1;
  const hh = (rotated ? k.w : k.h) / 2 + 1;
  return {
    ...p,
    x: Math.max(hw, Math.min(100 - hw, p.x)),
    y: Math.max(hh, Math.min(100 - hh, p.y)),
  };
}
export default function DreamRoom() {
  const [design, setDesign] = useStored<Design>("room-design", initial);
  const [snapshots, setSnapshots] = useStored<Snapshot[]>("room-snapshots", []);
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<"furniture" | "room" | "saved">("furniture");
  const [grid, setGrid] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState("Моя комната");
  const [notice, setNotice] = useState("");
  const board = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    x: number;
    y: number;
  } | null>(null);
  const active = design.furniture.find((f) => f.id === selected);
  const update = (id: string, patch: Partial<Furniture>) =>
    setDesign((d) => ({
      ...d,
      furniture: d.furniture.map((f) =>
        f.id === id ? clampPiece({ ...f, ...patch }) : f,
      ),
    }));
  const add = (kind: Kind) => {
    if (design.furniture.length >= 30) {
      setNotice(
        "В комнате уже 30 предметов. Убери один, чтобы добавить новый.",
      );
      return;
    }
    const p = { id: crypto.randomUUID(), kind, x: 50, y: 50, rotation: 0 };
    setDesign((d) => ({ ...d, furniture: [...d.furniture, p] }));
    setSelected(p.id);
    setNotice("");
  };
  const remove = () => {
    setDesign((d) => ({
      ...d,
      furniture: d.furniture.filter((f) => f.id !== selected),
    }));
    setSelected(null);
  };
  const save = () => {
    if (!name.trim()) return;
    setSnapshots((v) =>
      [
        {
          id: crypto.randomUUID(),
          name: name.trim(),
          design: structuredClone(design),
        },
        ...v,
      ].slice(0, 12),
    );
    setSaveOpen(false);
    setNotice("Дизайн сохранён! Найди его во вкладке «Сохранённые».");
  };
  return (
    <div className="room-project">
      <div className="project-toolbar">
        <div className="room-logo">
          <Armchair size={25} /> dream<span>room</span>
          <span className="pill">Место для твоих идей</span>
        </div>
        <button className="button primary" onClick={() => setSaveOpen(true)}>
          <Save size={16} /> Сохранить дизайн
        </button>
      </div>
      <div className="room-layout">
        <section className="room-stage">
          <div className="room-stage-heading">
            <div>
              <span className="eyebrow">ТВОЯ ЛИЧНАЯ ВСЕЛЕННАЯ</span>
              <h2>Уют начинается с тебя.</h2>
            </div>
            <button
              className={`icon-button ${grid ? "active" : ""}`}
              aria-label="Показать сетку"
              aria-pressed={grid}
              onClick={() => setGrid((v) => !v)}
            >
              <Grid2X2 size={18} />
            </button>
          </div>
          <div className="room-outer">
            <div
              className={`room-board floor-${design.floor} ${grid ? "with-grid" : ""}`}
              style={{ "--wall-color": design.wall } as React.CSSProperties}
              ref={board}
              role="group"
              aria-label="План комнаты: перетаскивай мебель"
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) setSelected(null);
              }}
              onPointerMove={(e) => {
                const d = drag.current,
                  r = board.current?.getBoundingClientRect();
                if (!d || !r) return;
                update(d.id, {
                  x: d.x + ((e.clientX - d.startX) / r.width) * 100,
                  y: d.y + ((e.clientY - d.startY) / r.height) * 100,
                });
              }}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
            >
              <div className="room-window">
                <i />
                <i />
              </div>
              <div className="room-door" />
              {design.furniture.map((f) => {
                const kind = kinds.find((k) => k.kind === f.kind)!;
                return (
                  <button
                    key={f.id}
                    aria-label={`${kind.name}: переместить стрелками, R — повернуть, Delete — удалить`}
                    className={`furniture piece-${f.kind} ${selected === f.id ? "is-selected" : ""}`}
                    style={{
                      left: `${f.x}%`,
                      top: `${f.y}%`,
                      width: `${kind.w}%`,
                      height: `${kind.h}%`,
                      transform: `translate(-50%,-50%) rotate(${f.rotation}deg)`,
                      zIndex: f.kind === "rug" ? 1 : selected === f.id ? 8 : 3,
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setSelected(f.id);
                      drag.current = {
                        id: f.id,
                        startX: e.clientX,
                        startY: e.clientY,
                        x: f.x,
                        y: f.y,
                      };
                      e.currentTarget.setPointerCapture(e.pointerId);
                    }}
                    onKeyDown={(e) => {
                      const step = e.shiftKey ? 5 : 1;
                      const shifts: Record<string, Partial<Furniture>> = {
                        ArrowLeft: { x: f.x - step },
                        ArrowRight: { x: f.x + step },
                        ArrowUp: { y: f.y - step },
                        ArrowDown: { y: f.y + step },
                        r: { rotation: (f.rotation + 90) % 360 },
                        R: { rotation: (f.rotation + 90) % 360 },
                      };
                      if (shifts[e.key]) {
                        e.preventDefault();
                        update(f.id, shifts[e.key]);
                      }
                      if (e.key === "Delete" || e.key === "Backspace") {
                        e.preventDefault();
                        setDesign((d) => ({
                          ...d,
                          furniture: d.furniture.filter((p) => p.id !== f.id),
                        }));
                        setSelected(null);
                      }
                    }}
                  >
                    <FurnitureVisual kind={f.kind} />
                    {selected === f.id && <span className="selection-dot" />}
                  </button>
                );
              })}
            </div>
            <span className="room-dimension dim-bottom">5 м</span>
            <span className="room-dimension dim-side">5 м</span>
          </div>
          <div className="room-actionbar">
            {active ? (
              <>
                <span>
                  <MousePointer2 size={15} />
                  {kinds.find((k) => k.kind === active.kind)?.name}
                </span>
                <button
                  className="button secondary"
                  onClick={() =>
                    update(active.id, {
                      rotation: (active.rotation + 90) % 360,
                    })
                  }
                >
                  <RotateCw size={15} /> Повернуть
                </button>
                <button
                  className="icon-button"
                  aria-label="Дублировать предмет"
                  disabled={design.furniture.length >= 30}
                  onClick={() => {
                    const f = clampPiece({
                      ...active,
                      id: crypto.randomUUID(),
                      x: active.x + 8,
                      y: active.y + 8,
                    });
                    setDesign((d) => ({
                      ...d,
                      furniture: [...d.furniture, f],
                    }));
                    setSelected(f.id);
                  }}
                >
                  <Copy size={17} />
                </button>
                <button
                  className="icon-button danger"
                  aria-label="Удалить предмет"
                  onClick={remove}
                >
                  <Trash2 size={17} />
                </button>
              </>
            ) : (
              <span className="muted">
                <MousePointer2 size={15} /> Выбери предмет, чтобы изменить его
              </span>
            )}
          </div>
          <p className="stage-hint">
            <MousePointer2 size={13} /> Перетаскивай мебель · Стрелки —
            перемещение · R — поворот
          </p>
        </section>
        <aside className="room-settings">
          <div className="room-tabs">
            {(
              [
                { id: "furniture", text: "Мебель" },
                { id: "room", text: "Комната" },
                { id: "saved", text: "Сохранённые" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? "active" : ""}
                onClick={() => setTab(t.id)}
              >
                {t.text}
              </button>
            ))}
          </div>
          {tab === "furniture" ? (
            <>
              <div className="panel-title">
                <h3>Добавь немного уюта</h3>
                <span>{design.furniture.length}/30</span>
              </div>
              <p className="small muted">
                Нажми на предмет, затем поставь его на своё место.
              </p>
              <div className="furniture-picker">
                {kinds.map((k) => (
                  <button
                    key={k.kind}
                    onClick={() => add(k.kind)}
                    aria-label={`Добавить: ${k.name}`}
                  >
                    <div className={`furniture-preview piece-${k.kind}`}>
                      <FurnitureVisual kind={k.kind} />
                    </div>
                    <span>
                      {k.name}
                      <Plus size={13} />
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : tab === "room" ? (
            <>
              <div className="config-section">
                <label>
                  01 <strong>Цвет стен</strong>
                </label>
                <div className="color-swatches">
                  {[
                    "#acb9a0",
                    "#d3b3c1",
                    "#b1c4d2",
                    "#d8c7ac",
                    "#e9e4d8",
                    "#8d88a5",
                  ].map((c) => (
                    <button
                      key={c}
                      aria-label={`Цвет стен ${c}`}
                      style={{ background: c }}
                      className={design.wall === c ? "selected" : ""}
                      onClick={() => setDesign((d) => ({ ...d, wall: c }))}
                    >
                      {design.wall === c && <Check size={15} />}
                    </button>
                  ))}
                </div>
                <label className="custom-color">
                  Свой оттенок
                  <input
                    aria-label="Свой цвет стен"
                    type="color"
                    value={design.wall}
                    onChange={(e) =>
                      setDesign((d) => ({ ...d, wall: e.target.value }))
                    }
                  />
                </label>
              </div>
              <div className="config-section">
                <label>
                  02 <strong>Покрытие пола</strong>
                </label>
                <div className="floor-options">
                  {[
                    { id: "oak", name: "Тёплый дуб" },
                    { id: "light", name: "Светлый ясень" },
                    { id: "tile", name: "Плитка" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      className={design.floor === f.id ? "selected" : ""}
                      onClick={() => setDesign((d) => ({ ...d, floor: f.id }))}
                    >
                      <span className={`floor-${f.id}`} />
                      {f.name}
                      {design.floor === f.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <h3>Твои маленькие миры</h3>
              <p className="muted small">До 12 дизайнов в этом браузере.</p>
              {snapshots.length ? (
                snapshots.map((s) => (
                  <div className="saved-room" key={s.id}>
                    <div
                      className="saved-room-icon"
                      style={{ background: s.design.wall }}
                    >
                      <Armchair size={24} />
                    </div>
                    <div>
                      <strong>{s.name}</strong>
                      <small>{s.design.furniture.length} предметов</small>
                      <button
                        onClick={() => {
                          setDesign(structuredClone(s.design));
                          setSelected(null);
                          setNotice(`Загружен дизайн «${s.name}»`);
                        }}
                      >
                        Загрузить <ChevronDown size={12} />
                      </button>
                    </div>
                    <button
                      className="icon-button danger"
                      aria-label={`Удалить дизайн ${s.name}`}
                      onClick={() =>
                        setSnapshots((v) => v.filter((i) => i.id !== s.id))
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="mini-empty">
                  <Layers3 size={28} />
                  <p>Сохрани свой первый дизайн — он появится здесь.</p>
                </div>
              )}
            </>
          )}
          <div className="config-note">
            <span className="status-dot" /> Текущая комната сохраняется сама
          </div>
        </aside>
      </div>
      {notice && (
        <div className="room-notice" role="status">
          <Check size={16} />
          {notice}
          <button
            className="icon-button"
            aria-label="Скрыть уведомление"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {saveOpen && (
        <div className="modal-backdrop" onClick={() => setSaveOpen(false)}>
          <form
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Сохранить комнату"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <button
              type="button"
              className="icon-button close"
              aria-label="Закрыть"
              onClick={() => setSaveOpen(false)}
            >
              <X size={20} />
            </button>
            <Armchair size={30} className="accent" />
            <h2>Дай имя своему миру</h2>
            <p className="muted">
              Сохрани вариант, чтобы вернуться к нему позже.
            </p>
            <label>
              Название дизайна
              <input
                autoFocus
                required
                maxLength={45}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <button type="submit" className="button primary wide">
              <Save size={16} /> Сохранить
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
function FurnitureVisual({ kind }: { kind: Kind }) {
  return (
    <span className={`furniture-shape shape-${kind}`} aria-hidden="true">
      {kind === "sofa" ? (
        <>
          <i />
          <i />
          <b />
          <b />
        </>
      ) : kind === "bed" ? (
        <>
          <i />
          <i />
          <b />
        </>
      ) : kind === "desk" ? (
        <>
          <i />
          <b />
          <em />
        </>
      ) : kind === "plant" ? (
        <>
          <i />
          <i />
          <i />
          <i />
          <i />
          <b />
        </>
      ) : kind === "rug" ? (
        <>
          <i />
          <b />
        </>
      ) : kind === "table" ? (
        <>
          <i />
          <b />
        </>
      ) : kind === "shelf" ? (
        <>
          <i />
          <i />
          <i />
          <b />
        </>
      ) : (
        <>
          <i />
          <b />
        </>
      )}
    </span>
  );
}
