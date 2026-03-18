# Nuxt App

Nuxt frontend запускается автономно из каталога `nuxt-app` через Docker и `docker compose`.

## Docker

```bash
cp .env.example .env
make up
```

Локальная разработка в контейнерах:

```bash
cp .env.example .env
make up-local
```

Полезные команды:

- `make help` — список доступных команд
- `make logs` — логи frontend
- `make down` — остановить frontend
- `make down-local` — остановить локальный dev-стек
- `make clean` — остановить стек и удалить volumes
- `make clean-local` — удалить локальный dev-стек вместе с dev-volumes
- `make up` использует `docker-compose.yml`
- `make up-local` использует `docker-compose.yml` + `docker-compose.local.override.yml`

По умолчанию приложение доступно на `http://localhost:3000`.

## Локальная разработка без Docker

- `npm run dev:clean` — очистка кэшей Nuxt и запуск dev
- `npm run dev` — запуск dev сервера
- `npm run lint` — линтинг
- `npm run typecheck` — проверка TypeScript
- `npm run build` — production сборка

## Структура

- `app/app.vue` — корневой компонент
- `app/layouts/` — layouts
- `app/pages/` — файловый роутинг
- `app/components/` — переиспользуемые компоненты
- `app/assets/css/` — глобальные стили и шрифты
