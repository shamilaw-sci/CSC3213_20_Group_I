# TryVora Database Setup

TryVora uses MySQL with Prisma ORM 7.9.1. The Prisma schema and migrations are shared through Git, but every developer should use their own local database and private `.env` file.

## Requirements

- Node.js
- npm
- MySQL or MariaDB
- Access to the TryVora Git repository

## First-time setup

From the `frontend` directory, install dependencies:

```powershell
npm install
```

Create an empty local database using a unique name, such as `tryvora_s210315`.

Copy the environment template only if `.env` does not already exist:

```powershell
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
}
```

Update the private `.env`:

```dotenv
DATABASE_URL="mysql://USERNAME:PASSWORD@127.0.0.1:3306/LOCAL_DATABASE_NAME"
```

Never commit `.env`.

## Create the database tables

```powershell
npx prisma migrate deploy
npx prisma generate
npx prisma migrate status
```

Expected migration status:

```text
Database schema is up to date!
```

## Test the connection

Start the application:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000/api/v1/health/database
```

A successful response contains:

```json
{
  "status": "ok",
  "database": "reachable"
}
```

## Backend usage

Use the shared Prisma instance:

```ts
import { prisma } from "@/server/db/prisma";
```

Do not create separate Prisma clients inside individual API routes.

## Schema-change workflow

1. Discuss the change with the responsible domain owner.
2. Update the feature branch from `developer`.
3. Coordinate the migration with the database integration owner.
4. Commit both `prisma/schema.prisma` and the migration.
5. Other members merge the updated `developer` branch.
6. Run `npx prisma migrate deploy`.
7. Run `npx prisma generate`.

## Safety rules

- Never commit `.env`.
- Never commit `app/generated/`.
- Never commit database passwords or secret keys.
- Never run `prisma migrate reset` on shared or production databases.
- Never run `prisma db push` on shared or production databases.
- Do not commit results from `prisma db pull` without team review.
- Back up important data before destructive migrations.