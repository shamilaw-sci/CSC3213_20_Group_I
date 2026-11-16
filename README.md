# TryVora Digital Fitting Room

TryVora is a Next.js digital fitting-room application with customer, merchant, and administrator workflows. Customers can manage a Digital Twin photo and measurements, explore products, save favourites, compare products, receive fit-based recommendations, and use the current illustrative Try-On preview.

> **Active application:** The complete application is in `frontend/`. Run all commands in this README from that directory. The repository root also contains an older/secondary Next.js app.

## Technology

- Next.js `16.2.3`, React `19.2.4`, TypeScript
- Tailwind CSS 4
- Prisma `7.9.1` with the MariaDB adapter
- MySQL or MariaDB
- JWT authentication with HTTP-only cookies and bcrypt password hashing
- Vitest, ESLint, Sharp, Zod, jose, Nodemailer and Recharts

## Requirements and installation

- Node.js compatible with `frontend/package.json`
- npm
- MySQL or MariaDB

```powershell
cd frontend
npm install
```

## Environment configuration

Create a private environment file and never commit it:

```powershell
Copy-Item .env.example .env
```

Set these values in `frontend/.env` for local use:

```dotenv
APP_URL="http://localhost:3000"
DATABASE_URL="mysql://USERNAME:PASSWORD@127.0.0.1:3306/tryvora"
JWT_ACCESS_SECRET="a-long-random-secret-at-least-32-characters"
DATA_ENCRYPTION_KEY="a-64-character-hexadecimal-key"
DIGITAL_TWIN_URL_SIGNING_SECRET="a-long-random-signing-secret-at-least-32-characters"
PRIVATE_STORAGE_ROOT="./private-storage"
```

`DATABASE_URL`, `JWT_ACCESS_SECRET`, `DATA_ENCRYPTION_KEY`, and `DIGITAL_TWIN_URL_SIGNING_SECRET` are required for the database, authentication, and Digital Twin functionality. Generate real random values; do not use the examples in production.

Optional settings include `APP_ORIGIN`, `NEXT_PUBLIC_APP_URL`, and `DELETED_TWIN_RETENTION_DAYS`. The application provides defaults for these values. The template also contains `DEPLOYMENT_VERSION`, `MAX_UPLOAD_SIZE_MB`, and `MAX_CONCURRENT_TRY_ONS`; these are not currently read by the active application code and are not required for local evaluation.

For local password reset, use `MAIL_TRANSPORT="console"`; reset links are printed in the development terminal. Production delivery requires `MAIL_TRANSPORT="smtp"` plus `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. Use a public HTTPS `APP_URL` in production.

Administrator seeding additionally requires private values for `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. The password must be at least eight characters and contain an uppercase letter and a number. Do not publish the actual credentials.

## Database initialization

Install MySQL or MariaDB on Windows and ensure its service is running. Find the actual service name with:

```powershell
Get-Service *mysql*, *maria*
```

If it is stopped, start the service name shown on your machine:

```powershell
Start-Service -Name "<service-name-from-Get-Service>"
```

Create an empty database:

```powershell
mysql -u root -p -e "CREATE DATABASE tryvora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Use the database name, username, password, host and port that match `DATABASE_URL`. The checked-in schema and migration are `frontend/prisma/schema.prisma` and `frontend/prisma/migrations/0_init/migration.sql`.

```powershell
npx prisma migrate deploy
npx prisma generate
npx prisma migrate status
```

Do not run `prisma migrate reset` or `prisma db push` against shared or production data.

## Fresh Windows PowerShell setup sequence

From a fresh clone:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Edit `.env` before continuing. Set a valid `DATABASE_URL` for the empty database, a strong `JWT_ACCESS_SECRET`, a valid 32-byte/64-character hexadecimal `DATA_ENCRYPTION_KEY`, and a strong `DIGITAL_TWIN_URL_SIGNING_SECRET`. Keep secrets private.

Then run:

```powershell
mysql -u root -p -e "CREATE DATABASE tryvora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
npx prisma migrate deploy
npx prisma generate
npx tsx scripts/seed.ts
npm run db:seed-admin
npm run dev
```

If the database already exists, do not rerun the `CREATE DATABASE` command. Ensure the database credentials in `.env` match the account used by MySQL. Set the private administrator values described below before running `npm run db:seed-admin`.

## Demo data and administrator

The catalogue seed creates demo categories, active merchants, products, variants, images, and an example fit-range chart. It uses the database configured by `DATABASE_URL`; use it for a fresh local/demo database only.

Before running the administrator seed, set private example values in `frontend/.env` or in the current PowerShell session:

```powershell
$env:ADMIN_NAME = "TryVora Administrator"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "ReplaceWithYourStrongPassword123"
npm run db:seed-admin
```

These are placeholders only. Replace them with secure demo credentials and do not publish the password.

The catalogue seed creates merchant records and catalogue data, but it does **not** create customer or merchant login accounts.

### Customer demo account

Customer accounts must be created through the application:

1. Start the application with `npm run dev`.
2. Visit `/register`.
3. Register a customer account.
4. Log in through `/login`.

### Merchant demo account

Seeded merchant records cannot log in directly because the seed does not create merchant-associated user accounts. Use this workflow instead:

1. Register a customer account.
2. Open `/merchant/onboarding`.
3. Complete the merchant application.
4. Log in as an administrator.
5. Approve the merchant at the admin merchant-management page.
6. Log in again if necessary so the updated role is loaded.
7. Open `/merchant`.
8. Add products to the merchant catalogue.

New products are saved as `DRAFT`; an administrator must activate them before customers can see them.

## Database handoff for evaluators

### A. Local database

The supported self-contained setup is a local MySQL/MariaDB database:

1. Install and start MySQL/MariaDB.
2. Create an empty database.
3. Set `DATABASE_URL` in `.env`.
4. Run the committed Prisma migration.
5. Generate the Prisma client.
6. Run the catalogue and administrator seed commands.

### B. Hosted database

This repository does not currently provide hosted database credentials. The project owner must arrange a hosted MySQL/MariaDB instance if evaluators should use one.

Provide evaluator access securely through a private handoff or deployment-secret manager. Use a restricted database user with only the permissions required by the evaluator, and never publish a production password or unrestricted `DATABASE_URL` in this README or in a public repository.

## Run the application

```powershell
npm run dev
```

Open `http://localhost:3000`. Database health is available at `/api/v1/health/database`.

## Main workflows

### Customer

Register or log in, upload a valid Digital Twin photo, save measurements, explore products, use Try On, save favourites, compare products, and open Recommended For You. Recommendations combine available measurement fit ranges with saved activity such as favourites, comparisons, Try-On sessions, and merchant redirects.

### Merchant

1. Submit `/merchant/onboarding`.
2. Have an administrator approve the merchant.
3. Log in again and open `/merchant`.
4. Add products, images, variants, stock, and optional fit ranges.
5. Products are created as `DRAFT`.
6. An administrator activates products from `/admin/products`.
7. Eligible active products appear in Explore and recommendations.

### Administrator

Use the privately seeded administrator account to review users, merchants, products, Digital Twins, analytics, and security-related features. Merchant approval precedes product creation; product activation precedes customer visibility.

## Digital Twin and Try-On limitation

Digital Twin images use private local storage, encryption, and signed URLs. Local storage is not durable across deployments without a persistent volume or external storage service.

The current Try-On implementation produces an **illustrative fitting preview**. It does not generate a real AI photograph of the customer wearing the selected product, and no external AI image-generation provider is configured in this repository.

## Product image storage

Merchant product uploads use the existing local upload flow under the application's public upload area. This is suitable for local evaluation. A hosted deployment needs persistent storage if uploaded images must survive redeployments.

## Tests and validation

Run from `frontend`:

```powershell
npm run typecheck
npm test
npm run test:auth
npm run test:digital-twin
npm run lint
npm run build
```

Focused suites:

```powershell
npx vitest run tests/unit/recommendations tests/unit/catalogue
npx vitest run tests/unit/digital-twin
```

Review any unrelated pre-existing ESLint findings separately from feature-specific tests.

## Troubleshooting

### Database connection or Prisma pool timeout

Confirm MySQL/MariaDB is running, port `3306` is reachable, the database exists, credentials are valid, and `DATABASE_URL` is loaded from `frontend/.env`. Then run `npx prisma migrate status`.

### Login or registration server error

Check the server terminal for database errors and confirm `DATABASE_URL`, `JWT_ACCESS_SECRET`, and the initial migration are available.

### Digital Twin upload failure

Confirm `DATA_ENCRYPTION_KEY`, `DIGITAL_TWIN_URL_SIGNING_SECRET`, and a writable private storage directory. The image must satisfy the supported format, size, and dimension requirements.

### Merchant product missing from Explore

The merchant must be approved, the product must be created as `DRAFT`, and an administrator must activate it at `/admin/products`. Only eligible active products are customer-visible.

### Password reset email not received

With `MAIL_TRANSPORT=console`, the reset link is intentionally printed in the terminal. Configure valid SMTP settings for real delivery.

## Security rules

Never commit or share `.env` files, database passwords, JWT secrets, Digital Twin encryption/signing secrets, SMTP passwords, administrator passwords, private Digital Twin files, or customer uploads. The repository includes `.env.example`, schema, migrations, and seed scripts, but no real credentials.

## Repository structure

```text
frontend/
Ôö£ÔöÇÔöÇ app/                 Next.js pages and API routes
Ôö£ÔöÇÔöÇ features/            Customer, auth, cart, profile and Try-On features
Ôö£ÔöÇÔöÇ server/              Database, auth, storage and recommendation services
Ôö£ÔöÇÔöÇ prisma/              Schema and migrations
Ôö£ÔöÇÔöÇ scripts/             Catalogue and administrator seed scripts
Ôö£ÔöÇÔöÇ tests/               Unit and authentication tests
Ôö£ÔöÇÔöÇ docs/                Operational setup notes
Ôö£ÔöÇÔöÇ package.json
ÔööÔöÇÔöÇ .env.example
```

For evaluation, start in `frontend/`, configure a private MySQL/MariaDB database and secrets, deploy the checked-in migration, seed demo data, and run the validation commands above.
