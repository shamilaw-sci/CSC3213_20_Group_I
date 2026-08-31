# TryVora Structure and Ownership

This repository uses `frontend/` as the canonical Next.js application. The new
directories are scaffolding only. Existing source files remain in place until
their feature owner migrates them in a dedicated feature pull request.

Empty future modules contain `.gitkeep` so Git preserves the agreed structure
without exposing incomplete Next.js pages or API routes.

## Owner legend

| Marker | Owner | Domain |
| --- | --- | --- |
| `315` | S/21/315 | Authentication, users, sessions, guest sessions and RBAC |
| `063` | S/21/063 | Profile, measurements, Digital Twin, storage and privacy |
| `501` | S/21/501 | Catalogue, merchants, comparisons and redirects |
| `490` | S/21/490 | Virtual Try-On, admin UI, analytics, feedback and audit logs |
| `Shared` | Integration coordinator with team review | Application-wide foundation |

## Directory ownership

| Directory | Owner |
| --- | --- |
| `app/(public)/login`, `register`, password recovery | 315 |
| `app/(public)/explore`, `products`, `compare` | 501 |
| `app/(customer)/profile`, `digital-twin` | 063 |
| `app/(customer)/try-ons` | 490 |
| `app/(customer)/comparisons`, `favorites` | 501 |
| `app/merchant` | 501 |
| `app/admin` user interface | 490 |
| `app/api/v1/auth`, `users`, `guest-sessions` | 315 |
| `app/api/v1/profiles`, `digital-twins` | 063 |
| `app/api/v1/products`, `merchants`, `comparisons`, `redirects`, `favorites` | 501 |
| `app/api/v1/try-ons`, `feedback` | 490 |
| `features/auth` | 315 |
| `features/profile`, `features/digital-twin` | 063 |
| `features/catalogue`, `comparison`, `favorites`, `merchant` | 501 |
| `features/try-on`, `features/admin` | 490 |
| `server/auth`, `authorization` | 315 |
| `server/storage` | 063 |
| `server/integrations/merchants` | 501 |
| `server/integrations/try-on` | 490 |
| `server/modules/auth`, `users`, `guest-sessions` | 315 |
| `server/modules/profiles`, `digital-twins` | 063 |
| `server/modules/products`, `merchants`, `comparisons`, `redirects` | 501 |
| `server/modules/try-ons`, `analytics`, `feedback` | 490 |
| `server/audit` | 490 |

## Admin ownership split

S/21/490 owns the admin pages and shared admin presentation. Domain backend
ownership remains with the member responsible for that domain.

| Admin capability | UI owner | Backend owner |
| --- | --- | --- |
| User management | 490 | 315 |
| Digital Twin monitoring | 490 | 063 |
| Product management | 490 | 501 |
| Merchant management | 490 | 501 |
| Try-On monitoring | 490 | 490 |
| Analytics, feedback and audit logs | 490 | 490 |
| RBAC | N/A | 315 |

## Shared files

The integration coordinator merges changes to these files after team review:

- `app/layout.tsx`
- `app/providers.tsx`
- `app/globals.css`
- `server/db/prisma.ts`
- `prisma/schema.prisma`
- `prisma/migrations/`
- `next.config.ts`
- `prisma.config.ts`
- `package.json`
- `package-lock.json`
- `.env.example`

## Prisma model ownership

| Models | Owner |
| --- | --- |
| `User`, `Session`, `PasswordResetToken`, `GuestSession` | 315 |
| `Profile`, `Measurement`, `DigitalTwin` | 063 |
| `Merchant`, `Category`, `Product`, `ProductImage`, `ProductVariant`, `Comparison`, `ComparisonItem`, `Favorite`, `MerchantRedirect` | 501 |
| `TryOnSession`, `TryOnResult`, `Feedback`, `AuditLog` | 490 |

All models live in one shared Prisma schema. Members propose their model changes,
then the integration coordinator merges them and generates migrations from the
latest shared schema. Never edit an existing shared migration.

## Existing code migration

Do not create new development in the repository-root `src/` application.
Migrate useful code into the matching `frontend/` owner directory gradually.
Route-group pages and API `route.ts` files should only be created when their
implementation is ready, preventing duplicate routes and invalid empty modules.
