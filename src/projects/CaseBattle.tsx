import { useEffect, useRef, useState } from "react";
import {
  Archive,
  Coins,
  Gift,
  PackageOpen,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useStored } from "../hooks";
type Item = {
  id: string;
  name: string;
  icon: string;
  color: string;
  rarity: string;
  value: number;
};
const items = [
  {
    name: "Лунный кристалл",
    icon: "💎",
    color: "#a5d8ed",
    rarity: "Обычный",
    value: 40,
  },
  {
    name: "Космо-кеды",
    icon: "👟",
    color: "#91d7aa",
    rarity: "Необычный",
    value: 90,
  },
  {
    name: "Неоновый геймпад",
    icon: "🎮",
    color: "#b59af3",
    rarity: "Редкий",
    value: 180,
  },
  {
    name: "Галактический шлем",
    icon: "🧑‍🚀",
    color: "#ed9dd0",
    rarity: "Эпический",
    value: 350,
  },
  {
    name: "Золотая ракета",
    icon: "🚀",
    color: "#efce71",
    rarity: "Легендарный",
    value: 700,
  },
];
const cases = [
  {
    name: "Первый контакт",
    price: 100,
    icon: "📦",
    description: "Маленький шаг в большую коллекцию",
    odds: [50, 28, 15, 6, 1],
  },
  {
    name: "Галактика",
    price: 250,
    icon: "🛸",
    description: "Больше шансов на редкую находку",
    odds: [20, 35, 28, 14, 3],
  },
];
function pick(odds: number[]) {
  let n = Math.random() * 100;
  for (let i = 0; i < odds.length; i++) {
    n -= odds[i];
    if (n < 0) return items[i];
  }
  return items[0];
}
export default function CaseBattle() {
  const [balance, setBalance] = useStored("case-balance", 1000);
  const [inventory, setInventory] = useStored<Item[]>("case-inventory", []);
  const [last, setLast] = useStored<Item | null>("case-last", null);
  const [selected, setSelected] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [started, setStarted] = useState(false);
  const [reel, setReel] = useState(() =>
    Array.from({ length: 32 }, (_, i) => items[i % 5]),
  );
  const [tab, setTab] = useState<"all" | "rare">("all");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (frame.current) cancelAnimationFrame(frame.current);
    },
    [],
  );
  const c = cases[selected];
  const spin = () => {
    if (spinning || balance < c.price) return;
    const reward = { ...pick(c.odds), id: crypto.randomUUID() };
    setBalance((v) => v - c.price);
    setInventory((v) => [reward, ...v]);
    setLast(reward);
    setStarted(false);
    setSpinning(true);
    const strip = Array.from({ length: 32 }, () => pick(c.odds));
    strip[24] = reward;
    setReel(strip);
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => setStarted(true));
    });
    timer.current = setTimeout(
      () => setSpinning(false),
      document.documentElement.dataset.motion === "reduced" ? 150 : 3400,
    );
  };
  return (
    <div className="case-project">
      <div className="project-toolbar">
        <div className="project-wordmark">
          <PackageOpen size={22} />
          <span>
            CASE <b>BATTLE</b>
          </span>
          <span className="pill">Космическая коллекция</span>
        </div>
        <div className="balance">
          <Coins size={19} />
          <strong data-testid="balance">
            {balance.toLocaleString("ru-RU")}
          </strong>
          <span>очков</span>
          <button
            className="icon-button"
            aria-label="Добавить 500 бесплатных очков"
            disabled={spinning}
            onClick={() => setBalance((v) => v + 500)}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div className="case-intro">
        <span className="eyebrow accent">ОТКРОЙ НЕИЗВЕСТНОЕ</span>
        <h2>Что скрывает твой кейс?</h2>
        <p>Собирай космические находки. Каждое открытие — новое открытие.</p>
      </div>
      <div className="case-picker">
        {cases.map((v, i) => (
          <button
            key={v.name}
            disabled={spinning}
            onClick={() => setSelected(i)}
            className={selected === i ? "chosen" : ""}
          >
            <span>{v.icon}</span>
            <div>
              <strong>{v.name}</strong>
              <small>{v.price} очков</small>
            </div>
            {selected === i && <span className="case-check">✓</span>}
          </button>
        ))}
      </div>
      <div
        className={`roulette ${spinning ? "is-spinning" : ""}`}
        aria-label="Рулетка предметов"
      >
        <div className="roulette-pointer" />
        <div
          className="reel"
          style={{
            transform: `translateX(-${started ? 2936 : 56}px)`,
            transition: started
              ? "transform 3.2s cubic-bezier(.12,.75,.14,1)"
              : "none",
          }}
        >
          {reel.map((item, i) => (
            <div
              key={i}
              className="reel-item"
              style={{ "--item-color": item.color } as React.CSSProperties}
            >
              <span>{item.icon}</span>
              <strong>{item.name}</strong>
              <small>{item.rarity}</small>
            </div>
          ))}
        </div>
        <div className="roulette-shade" />
      </div>
      <div className="case-action">
        <button
          className="button primary"
          disabled={spinning || balance < c.price}
          onClick={spin}
        >
          <PackageOpen size={18} />
          {spinning ? "Ищем твою находку…" : `Открыть за ${c.price} очков`}
        </button>
        {balance < c.price ? (
          <button
            className="text-button"
            onClick={() => setBalance((v) => v + 500)}
          >
            Получить 500 бесплатных очков <Plus size={14} />
          </button>
        ) : (
          <small>
            <Gift size={13} /> Только виртуальные очки. Никаких покупок.
          </small>
        )}
      </div>
      {last && !spinning && (
        <div className="reward-notice" role="status">
          <Trophy size={20} style={{ color: last.color }} />
          <span>
            Твоя находка:{" "}
            <strong style={{ color: last.color }}>{last.name}</strong> ·{" "}
            {last.rarity}
          </span>
          <span>Уже в коллекции ✓</span>
        </div>
      )}
      <div className="case-lower">
        <section className="panel inventory">
          <div className="panel-title">
            <h3>
              <Archive size={18} /> Твоя коллекция{" "}
              <span>{inventory.length}</span>
            </h3>
            <select
              aria-label="Фильтр коллекции"
              value={tab}
              onChange={(e) => setTab(e.target.value as "all" | "rare")}
            >
              <option value="all">Все находки</option>
              <option value="rare">Редкие и выше</option>
            </select>
          </div>
          {!inventory.filter((i) => tab === "all" || i.value >= 180).length ? (
            <div className="mini-empty">
              <PackageOpen size={28} />
              <p>
                {tab === "rare"
                  ? "Редкие находки ещё впереди"
                  : "Открой первый кейс — коллекция начинается здесь"}
              </p>
            </div>
          ) : (
            <div className="inventory-grid">
              {inventory
                .filter((i) => tab === "all" || i.value >= 180)
                .map((item) => (
                  <div
                    className="inventory-item"
                    key={item.id}
                    style={{ borderColor: `${item.color}40` }}
                  >
                    <span>{item.icon}</span>
                    <strong>{item.name}</strong>
                    <small style={{ color: item.color }}>{item.rarity}</small>
                    <button
                      onClick={() => {
                        setInventory((v) => v.filter((i) => i.id !== item.id));
                        setBalance((v) => v + item.value);
                      }}
                      disabled={spinning}
                    >
                      Обменять · {item.value} <Coins size={12} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>
        <section className="panel odds">
          <h3>
            <Sparkles size={18} /> Что внутри?
          </h3>
          <p className="muted small">
            Шансы кейса «{c.name}». Каждое открытие независимо.
          </p>
          {items.map((i, index) => (
            <div key={i.name}>
              <span style={{ color: i.color }}>
                {i.icon} {i.rarity}
              </span>
              <strong>{c.odds[index]}%</strong>
            </div>
          ))}
          <p className="small muted">
            Предметы и очки существуют только в этой игре и не имеют денежной
            стоимости.
          </p>
        </section>
      </div>
    </div>
  );
}
