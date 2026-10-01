# Cloud Upload Manager

A Next.js app for uploading images to Cloudflare R2, storing their metadata in Cloudflare D1, and describing them with attributes. It is the admin backend of the Münzquell gallery.

## Features

- Multi-file upload to Cloudflare R2; image dimensions are detected automatically on upload
- Duplicate detection: a file whose content was uploaded before is rejected, whatever its name
- Overview table filtered and sorted like the frontend's gallery (attributes, tagged people, newest/oldest/likes/views), with the state in the URL; selectable columns; bulk delete and CSV export of the currently filtered uploads
- Attributes (e.g. Event, Jahr, Creator): each image must have exactly one option per attribute type — required at upload time and on the image edit page (`/uploads/[id]`); types and options are managed at `/attributes`
- User management for the public frontend's users (`/users`): overview with e-mail, display name, status, inviter, last login and groups; lock and unlock users
- User groups (`/groups`): create groups and manage their members
- Resources (`/ressourcen`): daily e-mail statistics of the last 30 days
- Deleting an image removes both the R2 object and the DB row; its attribute values, likes, views and person tags go automatically via `ON DELETE CASCADE`

## Getting started

This app is meant to run inside the `node` container defined by the repository root's `docker-compose.yml`:

```bash
docker compose up -d        # from the repo root
docker compose exec node npm run dev
```

Open http://localhost:3000.

## Environment variables

Configured via `.env.local` (not checked in):

- `D1_DATABASE_ID`, `CLOUDFLARE_API_TOKEN` — Cloudflare D1 (queried over its HTTP API, not a Workers binding)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` — Cloudflare R2 storage (the account id also doubles as the D1 account id, since both live in the same Cloudflare account)

## Database schema

The schema lives in `migrations/*.sql`, applied with:

```bash
npm run migrate
```

The runner tracks applied migrations in a `schema_migrations` table and only runs the ones that aren't recorded yet, so it's safe to re-run.

Tables, constraints and the rules for attributes are described in [docs/data-model.md](docs/data-model.md).

## Commands

- `npm run dev` — start the dev server on port 3000
- `npm run build` / `npm run start` — production build and run
- `npm run lint` — ESLint
- `npm run migrate` — apply pending database migrations

## Project structure

- `app/` — routes, pages, and client components (App Router)
- `services/` — database access (`uploadService`, `attributeService`, `personTagService`, `userService`, `groupService`, `mailStatsService`) and R2 storage (`storageService`)
- `lib/` — `db.ts` (Cloudflare D1 HTTP API client), `r2.ts` (S3 client for R2), `attributes.ts` (attribute validation), `csv.ts` (CSV export helper), `filterParams.ts` (the gallery's URL parameters), `formatSize.ts`
- `hooks/` — shared client hooks (`useSelection`, `useHiddenColumns`)
- `docs/` — project documentation (data model)
- `migrations/` — numbered SQL schema migrations, run via `scripts/migrate.mjs`
- `types/` — shared TypeScript types
