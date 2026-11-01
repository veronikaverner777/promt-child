# Публикация AI PLAYGROUND в GitHub Pages

Ожидаемый адрес сайта: https://veronikaverner777.github.io/promt-child/

## Имя репозитория и путь сайта

Репозиторий: `veronikaverner777/promt-child`. Переименовывать его не нужно.
Путь GitHub Pages соответствует имени репозитория: `/promt-child/`.
В `vite.config.ts` задан `base: "/promt-child/"`, поэтому ссылки на скрипты,
стили и шрифты в production-сборке используют этот префикс.

## Сохранение изменений через Pull Request

Изменения подготовлены в ветке `codex/github-pages`:

- `.github/workflows/deploy-pages.yml` — сборка и публикация;
- `vite.config.ts` — `base: "/promt-child/"`;
- `DEPLOYMENT.md` — эта инструкция.

Отправьте ветку в GitHub, затем на странице репозитория откройте
**Pull requests → New pull request**. Выберите **base: main** и
**compare: codex/github-pages**, нажмите **Create pull request**.

Название: `Настроить автоматическую публикацию AI PLAYGROUND в GitHub Pages`.

Описание: `Добавляет GitHub Actions для npm ci, npm run build и публикации dist.
Настраивает Vite base /promt-child/. Дизайн, содержимое и функциональность
приложений не изменены. Репозиторий сохраняет имя promt-child.`

## Включение Pages и первая публикация

1. В **Settings → Pages → Build and deployment → Source** выберите
   **GitHub Actions**. Если GitHub не позволяет включить Pages для текущего
   репозитория, выполните требование, показанное в этом разделе (доступность
   Pages для приватных репозиториев зависит от тарифа).
2. Объедините Pull Request: **Merge pull request → Confirm merge**.
3. Откройте вкладку **Actions** и дождитесь успешного завершения
   **Publish AI PLAYGROUND to GitHub Pages**: этапов **Build website** и
   **Deploy website**.
4. Откройте адрес сайта из **Settings → Pages** или окружения `github-pages`.

Если workflow уже завершился ошибкой до включения Pages, после настройки
откройте его запуск в **Actions** и нажмите **Re-run all jobs**.
Также workflow можно запустить вручную из **Actions → Publish AI PLAYGROUND
to GitHub Pages → Run workflow**, выбрав ветку `main`.

При каждом последующем изменении в `main` сайт будет собираться и публиковаться
автоматически. Отдельная ветка `gh-pages`, секреты и токены не нужны:
workflow использует стандартный `GITHUB_TOKEN` и OIDC GitHub Actions.

## Проверка локальной сборки

```bash
npm ci
npm run build
npm run preview
```

Откройте путь `/promt-child/` на сервере предпросмотра. Hash-навигация
сохраняет этот префикс: например, `/promt-child/#car`. Настройки приложения,
игровой прогресс и дизайны комнат хранятся локально в браузере; они не
переносятся между адресом среды разработки и доменом GitHub Pages.
