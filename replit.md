# Витрина услуг МГУ

Портал для отображения и управления сервисами МГУ в виде виджетов с поиском, сортировкой и закреплением.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — запустить API-сервер (порт 8080)
- `pnpm --filter @workspace/mgu-portal run dev` — запустить фронтенд (порт 20127)
- `pnpm run typecheck` — полная проверка типов
- `pnpm run build` — typecheck + сборка всех пакетов
- `pnpm --filter @workspace/api-spec run codegen` — перегенерировать API-хуки и Zod-схемы
- `pnpm --filter @workspace/db run push` — применить изменения схемы БД (только dev)
- Required env: `DATABASE_URL` — строка подключения к Postgres

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Clerk Auth, @dnd-kit (drag-and-drop)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: Clerk (Replit-managed)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/widgets.ts` — схема таблицы widgets
- `artifacts/api-server/src/routes/widgets.ts` — CRUD для виджетов
- `artifacts/mgu-portal/src/pages/Home.tsx` — главная страница
- `artifacts/mgu-portal/src/components/` — модальные окна (форма/удаление)
- `attached_assets/мгу_фон_1776378187237.jpg` — фоновое изображение МГУ

## Architecture decisions

- Clerk auth через proxy — сервер проксирует запросы к Clerk через `/api/__clerk` для работы в iframe
- Drag-and-drop через @dnd-kit — виджеты можно перетаскивать для изменения порядка
- OpenAPI-first codegen — все API-хуки и Zod-схемы генерируются из `openapi.yaml`
- Схемы в openapi.yaml используют entity-shaped имена (WidgetInput, WidgetUpdate) во избежание коллизий с Orval auto-generated именами

## Product

- Главная страница с фоном МГУ и поиском по виджетам
- Виджеты = ссылки на сервисы МГУ (название, URL, описание, иконка)
- Закрепление виджетов в топ, drag-and-drop для изменения порядка
- Авторизация через Clerk (только для редактирования)
- PWA-поддержка (установка на устройство)

## Gotchas

- После изменения `openapi.yaml` — обязательно запустить codegen перед использованием новых типов
- Имена схем компонентов в openapi.yaml НЕ должны совпадать с `<OperationIdPascal>Body` (вызывает TS2308)
- Zod-схемы в api-zod экспортируются как `CreateWidgetBody`/`UpdateWidgetBody` (по operationId), TypeScript-типы — как `WidgetInput`/`WidgetUpdate` (по имени компонента)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
