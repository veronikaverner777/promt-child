export type ProjectId = "case" | "car" | "market" | "room";
export type Category = "Все проекты" | "Игры" | "3D" | "Сайты" | "Творчество";
export interface Project {
  id: ProjectId;
  title: string;
  category: Category;
  description: string;
  age: number;
  level: "Легко" | "Средне";
  color: string;
  tag: string;
}
export const projects: Project[] = [
  {
    id: "case",
    title: "Case Battle",
    category: "Игры",
    description:
      "Открывай кейсы, находи редкие предметы и собирай свою коллекцию.",
    age: 10,
    level: "Легко",
    color: "#b5f36a",
    tag: "Хит площадки",
  },
  {
    id: "car",
    title: "3D Car Studio",
    category: "3D",
    description:
      "Создай автомобиль мечты. Твой цвет, твои диски, твои правила.",
    age: 10,
    level: "Средне",
    color: "#b89bff",
    tag: "Настоящее 3D",
  },
  {
    id: "market",
    title: "Mini Market",
    category: "Сайты",
    description: "Исследуй свой онлайн-магазин: от первой покупки до заказа.",
    age: 7,
    level: "Легко",
    color: "#ffbc80",
    tag: "Пробуй в деле",
  },
  {
    id: "room",
    title: "Dream Room",
    category: "Творчество",
    description:
      "Придумай комнату, в которой хочется жить. И воплоти её в деталях.",
    age: 7,
    level: "Легко",
    color: "#f6a4d7",
    tag: "Дай волю идеям",
  },
];
export const projectById = (id: string) => projects.find((p) => p.id === id);
