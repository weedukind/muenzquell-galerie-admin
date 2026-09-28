# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This root is a docker-compose wrapper around one active application:

- `app-node/` — the actual application: a Next.js 16 (App Router) app called "Cloud Upload Manager". It used to be its own separate nested git repository; it's now tracked as regular files in this root repository (its prior standalone history was not carried over).
- `docker-compose.yml` — defines only the `node` service (builds `docker/node/Dockerfile`, mounts `./app-node` at `/app`, exposes 8081/3000/19006). There are commented-out `php` and `web` (nginx) services that are not implemented — ignore them unless asked to build them out. There used to be a `db` service (MariaDB) here; the app has since migrated its data layer to Cloudflare D1 (see "Data layer" below), so that service was removed. `docker/db/data` may still exist on disk from that era but is no longer used.
- `docker/node/Dockerfile` — plain `node:lts` image; its `CMD` just idles (`tail -f /dev/null`), so commands must be run via `docker compose exec node <cmd>` rather than relying on a container entrypoint.

All application code, dependencies, and commands below live under `app-node/`.

## Commands

Run from `app-node/` (or via `docker compose exec node <cmd>` if working inside the container):

- `npm run dev` — start the Next dev server on port 3000
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript rules)

There is no test suite configured in this repo currently.

Container lifecycle: `docker compose up -d` starts `node`; the node container has no long-running app process by default, so run `npm run dev` inside it explicitly.

## Architecture

Request flow for the core feature (upload a file → store in R2 → record metadata in Cloudflare D1):

1. `app/upload/page.tsx` renders `UploadForm` (client component), which POSTs a multipart form to `/api/upload`.
2. `app/api/upload/route.ts` generates a random object key (`crypto.randomUUID()` + original extension), uploads the buffer to R2 via `services/storageService.ts` (`uploadFile`), then persists metadata via `services/uploadService.ts` (`insertUpload`) into the `uploads` table. If the DB insert throws, the just-uploaded R2 object is deleted to avoid an orphaned file.
3. The home page (`app/page.tsx`) is a server component that calls `getUploads()` directly (not through the API route) and renders `FileManager` → `FileTable`, listing uploads with their tags joined in.
4. Deletion: `DeleteButton` calls `DELETE /api/upload/[id]`, which deletes both the R2 object and the DB row.
5. Tags: `services/tagService.ts` implements `getTags` / `createTag` / `assignTag` / `removeTag` / `getTagsForUploads` against `tags` and `upload_tags` tables, and `app/api/tags/route.ts` / `app/api/uploads/tags/route.ts` expose some of this. There is no UI yet to create or assign tags — this layer is wired at the service/DB level only, not surfaced in components.
6. Attributes: `services/attributeService.ts` manages `attribute_types` / `attribute_options` / `upload_attributes` (managed at `/attributes`). Every upload must have exactly one option per attribute type — `upload_attributes` has PK `(upload_id, attribute_type_id)`, but completeness can't be enforced by the DB (a newly added type has no values yet), so it is checked in `validateAttributeValues` (`lib/attributes.ts`) on `POST /api/upload` and `PUT /api/uploads/[id]/attributes` (edit page `/uploads/[id]`).
7. Users: `users` table (`services/userService.ts`, page `/users`) holds the users of the public frontend (`muenzquell-fe`, which shares this D1 database). They are created and log in there; this backend only lists them and toggles `is_locked`. `last_login_at IS NULL` means the invitation hasn't been accepted yet. The frontend's login also uses `login_codes` (one-time e-mail codes) and `sessions` (hashed session tokens). This backend reads `sessions` to show who is logged in and deletes a user's sessions to log them out (also done when locking); it never touches `login_codes`. Deleting a user cascades to both.

Pages that read from D1 call `await connection()` (from `next/server`) first — otherwise `next build` prerenders them statically and bakes in build-time data.

## Data layer

- The app was migrated from MariaDB (`mysql2`) to **Cloudflare D1** (SQLite-based). It does not run on Cloudflare Workers/Pages — the Next.js app stays a normal Node.js process (Docker), and talks to D1 purely over Cloudflare's HTTP Query API, not a native Workers binding.
- `lib/db.ts` — a small `fetch`-based wrapper around `POST https://api.cloudflare.com/client/v4/accounts/{account}/d1/database/{database_id}/query`, needing `D1_DATABASE_ID` and `CLOUDFLARE_API_TOKEN` (the account id is taken from the already-present `R2_ACCOUNT_ID`, since D1 and R2 live in the same Cloudflare account). Exposes `db.query<T>(sql, params)` → `T[]` and `db.execute(sql, params)` → `{ insertId, changes }` (mapped from D1's `meta.last_row_id`/`meta.changes`) — deliberately similar to the old mysql2 call shape but without its `[rows, fields]` tuple return.
- `migrations/*.sql` — numbered SQLite-dialect schema migrations (`uploads`, `tags`, `upload_tags` tables). Run them with `npm run migrate` (or `docker compose exec node npm run migrate`); the runner (`scripts/migrate.mjs`) is a standalone ES module script that talks to the same D1 HTTP API (not through `lib/db.ts`), reads `.env.local` itself, splits each `.sql` file on `;` before executing (D1 only accepts one statement per HTTP call), and tracks applied filenames in a `schema_migrations` table inside D1 itself.
- `lib/r2.ts` — an `S3Client` pointed at Cloudflare R2, needing `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`. These are populated in `app-node/.env.local`.
- Path alias `@/*` maps to the `app-node/` root (see `tsconfig.json`), e.g. `@/lib/db`, `@/services/uploadService`, `@/types/upload`.
- The actual D1 database (and the `D1_DATABASE_ID`/`CLOUDFLARE_API_TOKEN` values) must be created/obtained via the Cloudflare dashboard or `wrangler d1 create` — that's a one-time manual step outside this repo, not something `npm run migrate` does for you.

## Next.js version note

`app-node` pins `next@16.2.10` / `react@19.2.4` — newer than most training data, and `app-node/AGENTS.md` (imported by `app-node/CLAUDE.md`) explicitly warns that APIs/conventions may differ from what you expect. One concrete example already in this codebase: route handler `params` are async (`{ params }: { params: Promise<{ id: string }> }`, awaited inside the handler — see `app/api/upload/[id]/route.ts`). Before writing Next.js-specific code, check the bundled docs at `app-node/node_modules/next/dist/docs/` rather than relying on prior knowledge of Next.js conventions.
