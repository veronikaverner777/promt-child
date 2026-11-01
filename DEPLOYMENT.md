# Публикация AI PLAYGROUND в GitHub Pages

Ожидаемый адрес сайта: https://veronikaverner777.github.io/prompt-child/

## Сначала проверьте имя репозитория

При подготовке публикации фактический репозиторий назывался
`veronikaverner777/promt-child` (без второй буквы `p` в `prompt`).
Путь Pages определяется именем репозитория. Настройка Vite `base` не создаёт
другой адрес GitHub Pages.

Чтобы получить адрес `/prompt-child/`, откройте репозиторий на GitHub,
перейдите в **Settings → General → Repository name**, укажите `prompt-child`
и нажмите **Rename**. Переименование не меняет содержимое сайта.
Существующие ветки и Pull Request сохраняются. GitHub перенаправляет старый
адрес репозитория, но для последующей работы лучше выбрать новое имя
репозитория в настройках среды Codex.

Если сохранить имя `promt-child`, адрес сайта будет оканчиваться на
`/promt-child/`; в этом случае потребуется отдельно изменить `base` в
`vite.config.ts` на `/promt-child/`. Текущая конфигурация подготовлена именно
для запрошенного адреса `/prompt-child/`.

## Сохранение изменений через Pull Request

Изменения подготовлены в ветке `codex/github-pages`:

- `.github/workflows/deploy-pages.yml` — сборка и публикация;
- `vite.config.ts` — `base: "/prompt-child/"`;
- `DEPLOYMENT.md` — эта инструкция.

Отправьте ветку в GitHub, затем на странице репозитория откройте
**Pull requests → New pull request**. Выберите **base: main** и
**compare: codex/github-pages**, нажмите **Create pull request**.

Название: `Настроить автоматическую публикацию AI PLAYGROUND в GitHub Pages`.

Описание: `Добавляет GitHub Actions для npm ci, npm run build и публикации dist.
Настраивает Vite base /prompt-child/. Дизайн, содержимое и функциональность
приложений не изменены. Для целевого адреса необходимо имя репозитория prompt-child.`

## Включение Pages и первая публикация

1. Переименуйте репозиторий, как описано выше, чтобы имя совпадало с `base`.
2. В **Settings → Pages → Build and deployment → Source** выберите
   **GitHub Actions**. Если GitHub не позволяет включить Pages для текущего
   репозитория, выполните требование, показанное в этом разделе (доступность
   Pages для приватных репозиториев зависит от тарифа).
3. Объедините Pull Request: **Merge pull request → Confirm merge**.
4. Откройте вкладку **Actions** и дождитесь успешного завершения
   **Publish AI PLAYGROUND to GitHub Pages**: этапов **Build website** и
   **Deploy website**.
5. Откройте адрес сайта из **Settings → Pages** или окружения `github-pages`.

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

Откройте путь `/prompt-child/` на сервере предпросмотра. Hash-навигация
сохраняет этот префикс: например, `/prompt-child/#car`. Настройки приложения,
игровой прогресс и дизайны комнат хранятся локально в браузере; они не
переносятся между адресом среды разработки и доменом GitHub Pages.
