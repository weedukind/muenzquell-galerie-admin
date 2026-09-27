# Cloud Upload Manager

A Next.js app for uploading images to Cloudflare R2, storing their metadata in Cloudflare D1, and tagging them.

## Features

- Multi-file upload to Cloudflare R2; image dimensions are detected automatically on upload
- Overview table with bulk selection: bulk delete, bulk tag editing, an AND-based tag filter (clickable chips), and CSV export of the currently filtered uploads
- Tag images individually or in bulk, create new tags on the fly — including right at upload time, before the files exist
- Dedicated tag management page: create, rename, recolor, and delete tags, with a usage count per tag
- Attributes (e.g. Event, Jahr, Creator): each image must have exactly one option per attribute type — required at upload time and on the image edit page (`/uploads/[id]`); types and options are managed at `/attributes`
- Deleting an image removes both the R2 object and the DB row; tag associations are cleaned up automatically via `ON DELETE CASCADE`

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

Tables, constraints and the rules for tags and attributes are described in [docs/data-model.md](docs/data-model.md).

## Commands

- `npm run dev` — start the dev server on port 3000
- `npm run build` / `npm run start` — production build and run
- `npm run lint` — ESLint
- `npm run migrate` — apply pending database migrations

## Project structure

- `app/` — routes, pages, and client components (App Router)
- `services/` — database access (`uploadService`, `tagService`, `attributeService`) and R2 storage (`storageService`)
- `lib/` — `db.ts` (Cloudflare D1 HTTP API client), `r2.ts` (S3 client for R2), `attributes.ts` (attribute validation), `csv.ts` (CSV export helper), `formatSize.ts`
- `hooks/` — shared client hooks (`useSelection`)
- `docs/` — project documentation (data model)
- `migrations/` — numbered SQL schema migrations, run via `scripts/migrate.mjs`
- `types/` — shared TypeScript types
