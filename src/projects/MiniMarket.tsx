import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useStored } from "../hooks";
type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
  color: string;
  rating: string;
  description: string;
};
const products: Product[] = [
  {
    id: 1,
    name: "Наушники Air Pop",
    category: "Техника",
    price: 240,
    emoji: "🎧",
    color: "#d6c8e8",
    rating: "4.9",
    description:
      "Мягкий звук для больших идей. Беспроводные наушники в пастельном корпусе.",
  },
  {
    id: 2,
    name: "Рюкзак Explorer",
    category: "Аксессуары",
    price: 180,
    emoji: "🎒",
    color: "#d5dfbf",
    rating: "4.8",
    description:
      "Всё для нового приключения: удобный рюкзак с карманом для твоих секретов.",
  },
  {
    id: 3,
    name: "Кроссовки Cloud",
    category: "Одежда",
    price: 320,
    emoji: "👟",
    color: "#edcbb7",
    rating: "4.9",
    description:
      "Шагай навстречу новому. Лёгкие кроссовки для города и путешествий.",
  },
  {
    id: 4,
    name: "Камера Mini",
    category: "Техника",
    price: 460,
    emoji: "📷",
    color: "#bcd9dc",
    rating: "4.7",
    description:
      "Замечай красоту в мелочах. Компактная камера для первых историй.",
  },
  {
    id: 5,
    name: "Худи Daydream",
    category: "Одежда",
    price: 220,
    emoji: "👕",
    color: "#c4cfdf",
    rating: "4.8",
    description:
      "Любимая вещь для прохладных вечеров и уютных творческих сессий.",
  },
  {
    id: 6,
    name: "Скетчбук Ideas",
    category: "Творчество",
    price: 90,
    emoji: "📒",
    color: "#e3d7af",
    rating: "5.0",
    description:
      "Чистые страницы для смелых идей. Рисуй, записывай и фантазируй.",
  },
  {
    id: 7,
    name: "Палитра Mood",
    category: "Творчество",
    price: 120,
    emoji: "🎨",
    color: "#ddc6ce",
    rating: "4.9",
    description:
      "Двенадцать цветов и бесконечно много вариантов. Найди свою палитру.",
  },
  {
    id: 8,
    name: "Часы Orbit",
    category: "Аксессуары",
    price: 280,
    emoji: "⌚",
    color: "#bbd5c6",
    rating: "4.6",
    description: "Время для открытий. Минималистичные часы на каждый день.",
  },
];
interface Order {
  id: string;
  total: number;
  quantity: number;
  date: string;
  delivery: string;
}
export default function MiniMarket() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Всё");
  const [sort, setSort] = useState("popular");
  const [cart, setCart] = useStored<Record<string, number>>("market-cart", {});
  const [orders, setOrders] = useStored<Order[]>("market-orders", []);
  const [showCart, setShowCart] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [delivery, setDelivery] = useState("Пункт выдачи");
  const [added, setAdded] = useState<number | null>(null);
  const [showOrders, setShowOrders] = useState(false);
  const total = products.reduce((a, p) => a + p.price * (cart[p.id] ?? 0), 0);
  const quantity = Object.values(cart).reduce((a, b) => a + b, 0);
  const update = (id: number, n: number) =>
    setCart((c) => {
      const next = { ...c };
      if (n <= 0) delete next[id];
      else next[id] = Math.min(20, n);
      return next;
    });
  const add = (p: Product) => {
    setCart((c) => ({ ...c, [p.id]: Math.min(20, (c[p.id] ?? 0) + 1) }));
    setAdded(p.id);
  };
  const list = products
    .filter(
      (p) =>
        (cat === "Всё" || p.category === cat) &&
        p.name.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "cheap"
        ? a.price - b.price
        : sort === "expensive"
          ? b.price - a.price
          : Number(b.rating) - Number(a.rating),
    );
  const place = () => {
    if (quantity === 0) return;
    const result = {
      id: `MM-${Date.now().toString().slice(-7)}`,
      total,
      quantity,
      date: new Date().toLocaleDateString("ru-RU"),
      delivery,
    };
    setOrder(result);
    setOrders((o) => [result, ...o]);
    setCart({});
    setCheckout(false);
  };
  return (
    <div className="market-project">
      <div className="project-toolbar">
        <div className="market-logo">
          <ShoppingBag size={24} /> mini<span>market</span>
          <span className="pill">Учебный магазин</span>
        </div>
        <div className="toolbar-actions">
          <button className="text-button" onClick={() => setShowOrders(true)}>
            Мои заказы {orders.length > 0 && `(${orders.length})`}
          </button>
          <button
            className="button secondary"
            onClick={() => {
              setShowCart(true);
              setOrder(null);
              setCheckout(false);
            }}
          >
            <ShoppingCart size={17} /> Корзина{" "}
            <span className="cart-count">{quantity}</span>
          </button>
        </div>
      </div>
      <section className="market-hero">
        <div>
          <span className="eyebrow">МАЛЕНЬКИЕ ВЕЩИ. БОЛЬШОЕ ВДОХНОВЕНИЕ.</span>
          <h2>
            Для тебя.
            <br />
            Для твоих идей.
          </h2>
          <p>Находки, которые делают каждый день интереснее.</p>
          <span className="market-demo">
            <CheckCircle2 size={14} /> Учебные покупки — без оплаты и доставки
          </span>
        </div>
        <div className="market-hero-art">
          <span>🎧</span>
          <span>✳</span>
          <span>для твоих идей</span>
        </div>
      </section>
      <div className="market-filter">
        <div className="chip-row">
          {["Всё", "Техника", "Одежда", "Аксессуары", "Творчество"].map((c) => (
            <button
              className={`chip ${c === cat ? "active" : ""}`}
              key={c}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="market-search-sort">
          <label className="search-box">
            <Search size={16} />
            <input
              aria-label="Поиск товаров"
              placeholder="Найти товар"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="sort-label">
            <SlidersHorizontal size={16} />
            <select
              aria-label="Сортировка товаров"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">По рейтингу</option>
              <option value="cheap">Сначала дешевле</option>
              <option value="expensive">Сначала дороже</option>
            </select>
          </label>
        </div>
      </div>
      <div className="products-grid">
        {list.map((p) => (
          <article className="product" key={p.id}>
            <button
              className="product-image"
              style={{ background: p.color }}
              onClick={() => setDetail(p)}
              aria-label={`Подробнее: ${p.name}`}
            >
              <span>{p.emoji}</span>
              <small>
                <Star size={11} fill="currentColor" />
                {p.rating}
              </small>
            </button>
            <div className="product-body">
              <span className="muted small">{p.category}</span>
              <h3>
                <button onClick={() => setDetail(p)}>{p.name}</button>
              </h3>
              <div className="product-buy">
                <strong>
                  {p.price} <span>◈</span>
                </strong>
                <button
                  className={`add-cart ${added === p.id ? "added" : ""}`}
                  onClick={() => add(p)}
                  aria-label={`В корзину: ${p.name}`}
                >
                  {added === p.id ? <Check size={16} /> : <Plus size={16} />}{" "}
                  {added === p.id ? "Ещё один" : "В корзину"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!list.length && (
        <div className="empty-state">
          <Search size={30} />
          <h3>Таких товаров пока нет</h3>
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setCat("Всё");
            }}
          >
            Сбросить поиск
          </button>
        </div>
      )}
      <p className="market-footnote">
        ◈ — виртуальные единицы. Это учебный магазин: никаких списаний и
        реальной доставки.
      </p>
      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <section
            className="modal product-modal"
            role="dialog"
            aria-modal="true"
            aria-label={detail.name}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button close"
              onClick={() => setDetail(null)}
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
            <div className="detail-art" style={{ background: detail.color }}>
              {detail.emoji}
            </div>
            <span className="eyebrow">{detail.category}</span>
            <h2>{detail.name}</h2>
            <p className="muted">{detail.description}</p>
            <div className="product-buy">
              <strong>{detail.price} ◈</strong>
              <button className="button primary" onClick={() => add(detail)}>
                {added === detail.id ? "Добавить ещё" : "Добавить в корзину"}{" "}
                <Plus size={17} />
              </button>
            </div>
          </section>
        </div>
      )}
      {showCart && (
        <div
          className="modal-backdrop drawer-backdrop"
          onClick={() => setShowCart(false)}
        >
          <section
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Корзина"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button close"
              onClick={() => setShowCart(false)}
              aria-label="Закрыть корзину"
            >
              <X size={21} />
            </button>
            {order ? (
              <div className="order-success" role="status">
                <span>
                  <CheckCircle2 size={44} />
                </span>
                <h2>Отличная находка!</h2>
                <p>
                  Тестовый заказ <strong>{order.id}</strong> оформлен.
                </p>
                <p className="muted">
                  {order.quantity} шт. · {order.total} ◈<br />
                  Способ получения: {order.delivery}
                </p>
                <div className="info-note">
                  Это демонстрация. Оплата и доставка не требуются.
                </div>
                <button
                  className="button primary"
                  onClick={() => setShowCart(false)}
                >
                  Продолжить исследовать <ShoppingBag size={17} />
                </button>
              </div>
            ) : (
              <>
                <span className="eyebrow">ТВОИ НАХОДКИ</span>
                <h2>
                  {checkout ? "Оформление заказа" : "Корзина"}{" "}
                  <span className="muted">{quantity}</span>
                </h2>
                {quantity === 0 ? (
                  <div className="mini-empty">
                    <ShoppingBag size={40} />
                    <h3>Пока пусто</h3>
                    <p>Самая интересная находка ещё впереди.</p>
                    <button
                      className="button primary"
                      onClick={() => setShowCart(false)}
                    >
                      К покупкам
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {products
                        .filter((p) => cart[p.id])
                        .map((p) => (
                          <div className="cart-item" key={p.id}>
                            <span
                              className="cart-art"
                              style={{ background: p.color }}
                            >
                              {p.emoji}
                            </span>
                            <div>
                              <strong>{p.name}</strong>
                              <small>{p.price} ◈ / шт.</small>
                              <div className="quantity-control">
                                <button
                                  aria-label={`Уменьшить ${p.name}`}
                                  onClick={() => update(p.id, cart[p.id] - 1)}
                                >
                                  <Minus size={13} />
                                </button>
                                <span>{cart[p.id]}</span>
                                <button
                                  aria-label={`Увеличить ${p.name}`}
                                  disabled={cart[p.id] >= 20}
                                  onClick={() => update(p.id, cart[p.id] + 1)}
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            </div>
                            <div>
                              <strong>{cart[p.id] * p.price} ◈</strong>
                              <button
                                className="icon-button"
                                aria-label={`Удалить ${p.name}`}
                                onClick={() => update(p.id, 0)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                    {checkout && (
                      <div className="checkout-fields">
                        <h3>Способ получения</h3>
                        {["Пункт выдачи", "Курьер", "Самовывоз"].map((d) => (
                          <label key={d}>
                            <input
                              type="radio"
                              name="delivery"
                              value={d}
                              checked={delivery === d}
                              onChange={() => setDelivery(d)}
                            />
                            {d} <span>тестовый</span>
                          </label>
                        ))}
                        <p className="small muted">
                          Адрес, имя и банковская карта не нужны.
                        </p>
                      </div>
                    )}
                    <div className="cart-total">
                      <span>Итого</span>
                      <strong>{total} ◈</strong>
                    </div>
                    <button
                      className="button primary wide"
                      onClick={() => (checkout ? place() : setCheckout(true))}
                    >
                      {checkout
                        ? "Подтвердить тестовый заказ"
                        : "Оформить заказ"}{" "}
                      <ArrowIcon />
                    </button>
                    {checkout && (
                      <button
                        className="text-button"
                        onClick={() => setCheckout(false)}
                      >
                        Вернуться к корзине
                      </button>
                    )}
                    <p className="small muted">
                      Без оплаты, регистрации и настоящих денег.
                    </p>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      )}
      {showOrders && (
        <div className="modal-backdrop" onClick={() => setShowOrders(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Мои заказы"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button close"
              onClick={() => setShowOrders(false)}
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
            <h2>Мои тестовые заказы</h2>
            {orders.length ? (
              orders.map((o) => (
                <div className="order-history" key={o.id}>
                  <div>
                    <strong>{o.id}</strong>
                    <small>
                      {o.date} · {o.quantity} шт. · {o.delivery}
                    </small>
                  </div>
                  <strong>{o.total} ◈</strong>
                  <CheckCircle2 size={17} className="accent" />
                </div>
              ))
            ) : (
              <div className="mini-empty">
                <ShoppingBag size={30} />
                <p>Здесь появится твой первый заказ.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
function ArrowIcon() {
  return <span aria-hidden="true">→</span>;
}
