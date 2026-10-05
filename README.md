# ab-testing-service

A/B testing service API built with Koa, Knex and PostgreSQL. Plain JavaScript and CommonJS.

## Requirements

- Node.js 20+ (developed on 26)
- Docker with Docker Compose

## Getting started

```bash
cp .env.example .env        # adjust if needed
npm install
docker compose up -d        # starts Postgres
npm run migrate
npm run seed                # optional sample data
npm run dev                 # http://localhost:3000
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start the server |
| `npm run lint` | Run ESLint |
| `npm run migrate` | Apply pending migrations |
| `npm run migrate:make -- <name>` | Create a new migration in `src/db/migrations` |
| `npm run migrate:rollback` | Roll back the last migration batch |
| `npm run seed` | Run seed files in `src/db/seeds` |

## Project structure

```
src/
  server.js            # entry point: HTTP server + graceful shutdown
  app.js               # Koa app and middleware stack
  routes.js            # mounts feature routers (/health, /api/v1/...)
  config/              # env-based configuration (dotenv)
  db/                  # knex instance, migrations, seeds
  lib/                 # logger, error classes
  middleware/          # error handler, request logger, zod validation
  features/
    users/
      users.routes.js      # HTTP routes + validation
      users.controller.js  # HTTP layer: reads ctx, sets response
      users.service.js     # business logic
      users.repository.js  # data access (knex), maps snake_case rows to camelCase
      users.schema.js      # zod schemas
```

Each feature is split into three layers: **controller → service → repository**. Only the controller knows about Koa's `ctx`, and only the repository talks to the database.

### Adding a feature

1. Create `src/features/<name>/` with `<name>.routes.js`, `.controller.js`, `.service.js`, `.repository.js`, `.schema.js`.
2. Add a migration: `npm run migrate:make -- create_<name>`.
3. Mount the router in `src/routes.js`.

## API

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness + DB check (200 / 503) |
| GET | `/api/v1/users` | List users |
| GET | `/api/v1/users/:id` | Get user |
| POST | `/api/v1/users` | Create user `{ email, name }` |
| PUT | `/api/v1/users/:id` | Replace user `{ email, name }` |
| DELETE | `/api/v1/users/:id` | Delete user |

Errors are returned as `{ message, details? }` with status codes 400 (validation), 404 (not found), 409 (conflict) and 500.
