# ab-testing-service

A/B testing service API built with Koa, Knex and PostgreSQL, with BullMQ (Redis) for scheduling test activation and deactivation.

## Requirements

- Node.js 20+ (developed on 26)
- Docker with Docker Compose

## Run with Docker

```bash
cp .env.example .env
docker compose up -d --build                        # API on http://localhost:${API_PORT:-3000}
```

This starts Postgres, Redis, migrations, the API and the worker.

## Run locally

```bash
cp .env.example .env
npm install
docker compose up -d postgres redis
npm run migrate
npm run dev                 # http://localhost:3000
npm run worker:dev          # in a second terminal
```
