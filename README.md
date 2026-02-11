## theatre-tickets-notifier

A simple Telegram bot (Node.js + TypeScript) that notifies you when new tickets at the theatre are available to purchase.

### Features

- **Periodic checks**: Runs a check function every configurable number of minutes (default: **30 minutes**).
- **Environment-based config**: Telegram API key and interval are read from a `.env` file.
- **Pluggable checker**: Ticket availability logic is isolated in `src/checkTickets.ts` for easy customization.

### Setup

- **1. Install dependencies**

```bash
pnpm install
```

- **2. Create your `.env` file**

Create a file named `.env` in the project root:

```bash
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
# Optional: override default 30-minute interval between checks
# CHECK_INTERVAL_MINUTES=30
# DATABASE_URL=postgres://theatre:theatre_password@localhost:5432/theatre_bot
```

- **3. Implement your ticket check logic**

Edit `src/checkTickets.ts` and replace the placeholder implementation of `checkTicketsAvailable` with real logic that returns `true` when tickets are available.

- **4. Run the bot in development**

```bash
pnpm dev
```

Or build and run:

```bash
pnpm build
pnpm start
```

### Docker

- **Build**

```bash
docker build -t theatre-tickets-notifier .
```

- **Run (recommended: pass env via file)**

Make sure you have a local `.env` file with `TELEGRAM_BOT_TOKEN=...` and then:

```bash
docker run --rm --env-file .env theatre-tickets-notifier
```

### Docker Compose (bot + Postgres)

- **Start both services (db + bot)**

```bash
docker compose up -d --build
```

This will:
- start Postgres with a persistent volume
- build and start the bot image
- wire them together via the internal `db` hostname

### Using the bot

- **Start notifications**: In Telegram, start a chat with your bot and send `/start`.  
- **Stop notifications**: Send `/stop`.  
- **Check status**: Send `/status` to see whether the current chat is subscribed and what the check interval is.

The bot will periodically run `checkTicketsAvailable()` and, if it returns `true`, send a notification message to all subscribed chats.

