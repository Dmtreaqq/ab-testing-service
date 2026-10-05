# ab-testing-service

A/B testing service API built with Koa, Knex and PostgreSQL, with BullMQ (Redis) for scheduled jobs. Plain JavaScript and CommonJS.

## Requirements

- Node.js 20+ (developed on 26)
- Docker with Docker Compose

## Getting started

```bash
cp .env.example .env        # adjust if needed
npm install
docker compose up -d        # starts Postgres and Redis
npm run migrate
npm run seed                # optional sample data
npm run dev                 # http://localhost:3000
npm run worker:dev          # in a second terminal: scheduled job worker
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start the server |
| `npm run worker:dev` | Start the job worker with nodemon (auto-reload) |
| `npm run worker` | Start the job worker |
| `npm run lint` | Run ESLint |
| `npm run migrate` | Apply pending migrations |
| `npm run migrate:make -- <name>` | Create a new migration in `src/db/migrations` |
| `npm run migrate:rollback` | Roll back the last migration batch |
| `npm run seed` | Run seed files in `src/db/seeds` |

## Project structure

```
src/
  server.js            # entry point: HTTP server + graceful shutdown
  worker.js            # entry point: BullMQ worker + startup reconciliation
  app.js               # Koa app and middleware stack
  queues/              # BullMQ connection options and queues (producers)
  workers/             # BullMQ job processors
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

## Scheduled activation

A/B tests are always created with `active: false`. On create, the API enqueues two delayed jobs on the `abtests` queue:

| Job | jobId | Runs at | Effect |
|---|---|---|---|
| `activate` | `activate-<id>` | `dateStart` (immediately if in the past) | `active = true`, only if `dateEnd` hasn't passed |
| `deactivate` | `deactivate-<id>` | `dateEnd` | `active = false` |

Nothing is enqueued for a test whose `dateEnd` has already passed. Jobs retry 5 times with exponential backoff; a missing test fails the job without retries. Failed jobs are kept for 7 days.

Postgres is the source of truth. If enqueueing fails, the API still returns 201 and logs the error. On startup the worker reconciles: it deactivates active tests past `dateEnd` and makes sure every test that hasn't ended has its jobs (missing jobs are added, failed ones retried).

### Manual verification

```bash
# test that starts in 30s and ends in 60s
curl -X POST localhost:3000/api/v1/abtests -H 'content-type: application/json' \
  -d "{\"name\":\"t\",\"variantsCount\":2,\"dateStart\":\"$(date -u -d '+30 sec' +%FT%TZ)\",\"dateEnd\":\"$(date -u -d '+60 sec' +%FT%TZ)\"}"

docker compose exec redis redis-cli ZRANGE bull:abtests:delayed 0 -1   # activate-<id>, deactivate-<id>
curl localhost:3000/api/v1/abtests                                      # active flips true, then false
```
