# FindOrigin

Telegram-бот для поиска источников информации. Получает текст или ссылку на пост и находит возможные источники.

## Стек

- Next.js (App Router)
- TypeScript
- Деплой: Vercel

## Установка

```powershell
npm install
```

## Конфигурация

Скопируйте `.env.example` в `.env` и заполните:

```powershell
Copy-Item .env.example .env
```

- `TELEGRAM_BOT_TOKEN` — токен от [@BotFather](https://t.me/BotFather)
- `OPENAI_API_KEY` — для AI-анализа (потребуется на этапе поиска)

## Запуск

```powershell
npm run dev
```

## Webhook

После деплоя на Vercel установите webhook:

```powershell
$env:TELEGRAM_BOT_TOKEN = "YOUR_TOKEN"
.\scripts\set-webhook.ps1 -Url "https://your-app.vercel.app/api/telegram/webhook"
```

## Реализовано (до Этапа 5)

- ✅ Этап 1: Инициализация проекта (Next.js, зависимости)
- ✅ Этап 2: Webhook-эндпоинт `/api/telegram/webhook`
- ✅ Этап 3: Обработка ввода (текст и распознавание ссылок t.me / telegram.me)
- ✅ Этап 4: Извлечение сущностей (утверждения, даты, числа, имена, ссылки)
- ⏳ Этап 5+: Поиск источников, AI-анализ, отправка результатов
