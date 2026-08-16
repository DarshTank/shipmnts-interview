# API — <Task Name>

> Replace this heading and the sections below during the round. A filled-in
> README is the cheapest way to convert unfinished work into demonstrated judgment.

## Run

```bash
cp .env.example .env
npm install
npm run dev          # http://localhost:3000
npm test             # jest + supertest
```

Health check: `GET /health` · Readiness: `GET /ready`

## Problem statement

_(paste the statement you were given here, in your own words)_

## Assumptions

- ...
- ...

## Data model

| Entity | Fields | Notes |
|---|---|---|
| | | |

## Endpoints

| Method | Path | Description | Codes |
|---|---|---|---|
| GET | `/health` | Liveness | 200 |
| GET | `/api/v1/<resource>` | List, paginated + filtered | 200, 400 |
| POST | `/api/v1/<resource>` | Create | 201, 400, 409 |
| GET | `/api/v1/<resource>/:id` | Fetch one | 200, 400, 404 |
| PATCH | `/api/v1/<resource>/:id` | Partial update | 200, 400, 404, 409 |
| DELETE | `/api/v1/<resource>/:id` | Delete | 204, 404 |

## Response shape

Success:
```json
{ "success": true, "message": "OK", "data": { } }
```

List:
```json
{ "success": true, "message": "OK", "data": [], "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0, "hasNext": false } }
```

Error:
```json
{ "success": false, "message": "Validation failed", "errors": [{ "in": "body", "field": "name", "message": "name is required" }], "requestId": "..." }
```

## Design decisions

- **Layering** — `routes → controllers → services → repositories`. Controllers
  never contain business logic; services never touch the storage engine. Adding
  a feature touches one layer.
- **Storage** — in-memory store behind a repository interface. Swapping in
  Postgres/Mongo is a one-file change (`repositories/`). Chosen so the round is
  spent on API design rather than DB setup.
- **Validation** — Zod schemas at the route boundary; parsed values replace
  `req.body`/`query`/`params`, so nothing downstream re-validates.
- **Errors** — one `errorHandler`; controllers throw `ApiError`, never build
  responses for failures.
- **Concurrency** — optimistic locking via a `version` field and the `If-Match`
  header; a stale write gets 409 instead of silently overwriting.
- **Retries** — `Idempotency-Key` header on POST so a client timeout + retry
  cannot create a duplicate.

## Trade-offs / what I'd do next

- Persistence layer (Postgres + Prisma) with indexes on `<field>`.
- Auth: JWT access + refresh, role-based middleware.
- Move rate limiting and idempotency to Redis (current versions are per-process).
- Background queue (BullMQ) for anything slow so requests stay fast.
- More test coverage on business rules; contract tests for the list filters.

## Project structure

```
src/
  app.js                 express app (middleware order lives here)
  server.js              listen + graceful shutdown
  config/                env, db connection stub
  routes/                URL shape + validation schemas
  controllers/           request/response only
  services/              ALL business rules
  repositories/          storage access, swappable
  middlewares/           asyncHandler, validate, errors, idempotency, rateLimit
  utils/                 ApiError, ApiResponse, pagination, logger
tests/                   supertest integration tests
```
