import { test, expect } from "@playwright/test";
test("catalog: filters, search, favorites and persisted progress", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".project-card")).toHaveCount(4);
  await page
    .getByRole("group", { name: "Категория проекта" })
    .getByRole("button", { name: "3D", exact: true })
    .click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await expect(page.locator(".project-card h3")).toHaveText("3D Car Studio");
  await page
    .getByRole("group", { name: "Категория проекта" })
    .getByRole("button", { name: "Все проекты" })
    .click();
  await page.getByLabel("Возраст", { exact: true }).selectOption("7");
  await expect(page.locator(".project-card")).toHaveCount(2);
  await page.getByLabel("Возраст", { exact: true }).selectOption("all");
  await page.getByLabel("Сложность", { exact: true }).selectOption("Средне");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.getByLabel("Сложность", { exact: true }).selectOption("all");
  await page.getByLabel("Поиск проектов").fill("room");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "В избранное Dream Room", exact: true })
    .click();
  await page.getByRole("button", { name: "Очистить поиск" }).click();
  await page
    .getByRole("navigation", { name: "Главная навигация" })
    .getByRole("button", { name: /Избранное/ })
    .click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.reload();
  await page
    .getByRole("navigation", { name: "Главная навигация" })
    .getByRole("button", { name: /Избранное/ })
    .click();
  await expect(page.locator(".project-card h3")).toHaveText("Dream Room");
  await page
    .getByRole("button", { name: "Открыть проект", exact: true })
    .click();
  await expect(page).toHaveURL(/#room/);
  await page.getByRole("button", { name: "К каталогу" }).click();
  await expect(page.locator(".card-category")).toContainText("Уже исследован");
});
test("case: roulette, balance, exchange and persistence", async ({ page }) => {
  await page.goto("/#case");
  await expect(page.getByTestId("balance")).toHaveText("1 000");
  await page.getByRole("button", { name: "Открыть за 100 очков" }).click();
  await expect(
    page.getByRole("button", { name: "Ищем твою находку…" }),
  ).toBeDisabled();
  await expect(page.locator(".reward-notice")).toBeVisible({ timeout: 6000 });
  await expect(page.locator(".inventory-item")).toHaveCount(1);
  await expect(page.getByTestId("balance")).toHaveText("900");
  const expected = await page.evaluate(
    () => JSON.parse(localStorage.getItem("aip.case-inventory")!)[0],
  );
  await page.reload();
  await expect(page.locator(".inventory-item strong")).toHaveText(
    expected.name,
  );
  await page.locator(".inventory-item button").click();
  await expect(page.locator(".inventory-item")).toHaveCount(0);
  await expect(page.getByTestId("balance")).toHaveText(
    (900 + expected.value).toLocaleString("ru-RU"),
  );
  await page
    .getByRole("button", { name: "Добавить 500 бесплатных очков" })
    .click();
  await expect(page.getByTestId("balance")).toHaveText(
    (1400 + expected.value).toLocaleString("ru-RU"),
  );
  await page.getByRole("button", { name: /Галактика/ }).click();
  await expect(
    page.getByRole("button", { name: "Открыть за 250 очков" }),
  ).toBeVisible();
});
test("market: product search, cart editing, checkout and order history", async ({
  page,
}) => {
  await page.goto("/#market");
  await expect(page.locator(".product")).toHaveCount(8);
  await page.getByRole("button", { name: "Техника", exact: true }).click();
  await expect(page.locator(".product")).toHaveCount(2);
  await page.getByLabel("Поиск товаров").fill("камера");
  await expect(page.locator(".product")).toHaveCount(1);
  await page.getByRole("button", { name: "В корзину: Камера Mini" }).click();
  await page.getByLabel("Поиск товаров").fill("");
  await page
    .getByRole("button", { name: "В корзину: Наушники Air Pop" })
    .click();
  await page.getByRole("button", { name: /Корзина/ }).click();
  await page
    .getByRole("button", { name: "Увеличить Наушники Air Pop" })
    .click();
  await expect(page.locator(".cart-total strong")).toHaveText("940 ◈");
  await page.reload();
  await page.getByRole("button", { name: /Корзина/ }).click();
  await expect(page.locator(".cart-total strong")).toHaveText("940 ◈");
  await page.getByRole("button", { name: "Удалить Камера Mini" }).click();
  await expect(page.locator(".cart-total strong")).toHaveText("480 ◈");
  await page
    .getByRole("button", { name: "Оформить заказ", exact: true })
    .click();
  await page.getByRole("radio", { name: "Самовывоз" }).check();
  await page
    .getByRole("button", { name: "Подтвердить тестовый заказ" })
    .click();
  await expect(page.getByText("Отличная находка!")).toBeVisible();
  await expect(page.locator(".order-success")).toContainText("480 ◈");
  await page.getByRole("button", { name: "Продолжить исследовать" }).click();
  await page.reload();
  await page.getByRole("button", { name: /Мои заказы/ }).click();
  await expect(page.locator(".order-history")).toHaveCount(1);
  await expect(page.locator(".order-history")).toContainText("480 ◈");
});
test("room: adding, dragging, rotation, wall color and saved designs", async ({
  page,
}) => {
  await page.goto("/#room");
  await expect(page.locator(".furniture")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Добавить: Кровать", exact: true })
    .click();
  await expect(page.locator(".furniture")).toHaveCount(7);
  const bed = page.locator(".furniture.piece-bed");
  const before = await bed.boundingBox();
  await bed.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("r");
  await expect(bed).toHaveCSS("transform", /matrix\(0, 1, -1, 0/);
  const box = (await bed.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 50,
    box.y + box.height / 2 + 40,
    { steps: 7 },
  );
  await page.mouse.up();
  const after = (await bed.boundingBox())!;
  expect(after.x).not.toEqual(before!.x);
  await page.getByRole("button", { name: "Комната", exact: true }).click();
  await page.getByRole("button", { name: "Цвет стен #d3b3c1" }).click();
  await expect(page.locator(".room-board")).toHaveCSS(
    "--wall-color",
    "#d3b3c1",
  );
  await page
    .getByRole("button", { name: "Сохранить дизайн", exact: true })
    .click();
  await page.getByLabel("Название дизайна").fill("Лунная комната");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await page.reload();
  await expect(page.locator(".furniture")).toHaveCount(7);
  await expect(page.locator(".room-board")).toHaveCSS(
    "--wall-color",
    "#d3b3c1",
  );
  await page.getByRole("button", { name: "Сохранённые", exact: true }).click();
  await expect(page.locator(".saved-room")).toContainText("Лунная комната");
  await page.getByRole("button", { name: "Загрузить", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Загружен дизайн");
  await bed.click();
  await page
    .getByRole("button", { name: "Удалить предмет", exact: true })
    .click();
  await expect(page.locator(".furniture")).toHaveCount(6);
});
test("car: WebGL rendering, customization, camera and saved configuration", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#car");
  await expect(page.locator("canvas")).toBeVisible();
  await expect(
    page.getByText("3D требует WebGL.", { exact: false }),
  ).toHaveCount(0);
  await page.waitForTimeout(1000);
  const before = await page.locator("canvas").screenshot();
  await page.getByRole("button", { name: "Цвет кузова #e28572" }).click();
  await page.getByRole("button", { name: "Футуризм", exact: true }).click();
  await page.getByRole("button", { name: "Цвет подсветки #83e6ff" }).click();
  await page
    .getByRole("button", { name: "Повернуть автомобиль вправо" })
    .click();
  await page.waitForTimeout(300);
  const after = await page.locator("canvas").screenshot();
  expect(Buffer.compare(before, after)).not.toBe(0);
  await page
    .getByRole("button", { name: "Сохранить дизайн", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Дизайн сохранён" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Цвет кузова #e28572" }),
  ).toHaveClass(/selected/);
  await expect(
    page.getByRole("button", { name: "Футуризм", exact: true }),
  ).toHaveClass(/selected/);
  await expect(
    page.getByRole("button", { name: "Цвет подсветки #83e6ff" }),
  ).toHaveClass(/selected/);
  await page.getByRole("button", { name: "Автовращение", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Остановить", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Остановить", exact: true }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Скачать изображение автомобиля" })
    .click();
  expect((await download).suggestedFilename()).toBe("my-nova-gt.png");
  expect(errors).toEqual([]);
});
test("prompt generator: every project produces an editable custom prompt", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Хочу создать своё" }).click();
  const dialog = page.getByRole("dialog", { name: "Создай свою версию" });
  await dialog.getByLabel("Стиль и атмосфера").selectOption("Мир природы");
  await dialog.getByLabel("Своя идея").fill("Режим дня и ночи");
  for (const id of ["case", "car", "market", "room"]) {
    await dialog.getByLabel("Основа проекта").selectOption(id);
    await dialog.getByRole("button", { name: "Сгенерировать промпт" }).click();
    const prompt = await dialog
      .getByLabel("Твой промпт", { exact: true })
      .inputValue();
    expect(prompt).toContain("Мир природы");
    expect(prompt).toContain("Режим дня и ночи");
    expect(prompt).toContain("localStorage");
  }
  await dialog
    .getByLabel("Твой промпт", { exact: true })
    .fill("Моя новая идея");
  await expect(dialog.getByLabel("Твой промпт", { exact: true })).toHaveValue(
    "Моя новая идея",
  );
  await dialog.getByRole("button", { name: "Закрыть", exact: true }).click();
  await expect(dialog).not.toBeVisible();
});
test("mobile: all projects fit viewport and navigate back", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".project-card")).toHaveCount(4);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const id of ["case", "car", "market", "room"]) {
    await page.goto("/#" + id);
    await expect(
      page.getByRole("button", { name: "К каталогу" }),
    ).toBeVisible();
    await page.waitForTimeout(250);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "К каталогу" }).click();
    await expect(page.locator(".project-card")).toHaveCount(4);
  }
  await page.getByRole("button", { name: "Открыть меню" }).click();
  await page
    .getByRole("button", { name: "Как это работает", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: /Любопытство/ }),
  ).toBeVisible();
});
