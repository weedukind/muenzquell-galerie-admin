# Data model

All metadata lives in a single Cloudflare D1 (SQLite) database. The files themselves are stored in Cloudflare R2; the database only holds their object key and public URL. The schema is defined by the numbered files in `migrations/` and applied with `npm run migrate`.

```mermaid
erDiagram
    uploads ||--o{ upload_tags : "tagged with"
    tags ||--o{ upload_tags : "assigned to"
    uploads ||--o{ upload_attributes : "has value"
    attribute_types ||--o{ attribute_options : "offers"
    attribute_types ||--o{ upload_attributes : "value for"
    attribute_options ||--o{ upload_attributes : "chosen as"

    uploads {
        INTEGER id PK
        VARCHAR name
        VARCHAR object_key
        VARCHAR public_url
        VARCHAR mime_type
        INTEGER size
        INTEGER width
        INTEGER height
        TEXT created_at
    }
    tags {
        INTEGER id PK
        VARCHAR name UK
        VARCHAR color
    }
    upload_tags {
        INTEGER upload_id PK, FK
        INTEGER tag_id PK, FK
    }
    attribute_types {
        INTEGER id PK
        VARCHAR name UK
        INTEGER sort_order
    }
    attribute_options {
        INTEGER id PK
        INTEGER attribute_type_id FK
        VARCHAR name
        INTEGER sort_order
    }
    upload_attributes {
        INTEGER upload_id PK, FK
        INTEGER attribute_type_id PK, FK
        INTEGER option_id FK
    }
```

## Tags vs. attributes

Both classify images, but they follow different rules:

| | Tags | Attributes |
|---|---|---|
| Per image | any number, including none | **exactly one** option per attribute type |
| Values | free-form, created on the fly | fixed list of options, maintained at `/attributes` |
| Example | `Chroniken25`, `Stefan` | Event = Chroniken, Jahr = 25, Creator = Stefan |

## Tables

### `uploads` (`0001`, `0004`)

One row per uploaded file.

| Column | Type | Notes |
|---|---|---|
| `id` | `INTEGER` PK | autoincrement |
| `name` | `VARCHAR(255)` | original file name |
| `object_key` | `VARCHAR(255)` | R2 key: random UUID plus the original extension |
| `public_url` | `VARCHAR(255)` | public R2 URL of the object |
| `mime_type` | `VARCHAR(100)` | nullable |
| `size` | `INTEGER` | bytes |
| `width`, `height` | `INTEGER` | nullable; `NULL` for non-images or unsupported formats |
| `created_at` | `TEXT` | ISO 8601 UTC, set by the database |

### `tags` (`0002`) and `upload_tags` (`0003`)

`tags` holds `id`, a unique `name` and a `color` (hex; derived from the name if none is given). `upload_tags` is the many-to-many link with primary key `(upload_id, tag_id)`. Both foreign keys use `ON DELETE CASCADE`.

### `attribute_types` (`0005`)

The kinds of attributes every image must have, e.g. "Event".

| Column | Type | Notes |
|---|---|---|
| `id` | `INTEGER` PK | autoincrement |
| `name` | `VARCHAR(100)` | unique |
| `sort_order` | `INTEGER` | display order (columns, form fields); new types are appended |

### `attribute_options` (`0005`)

The allowed values of one attribute type, e.g. "Chroniken", "Conquest", "Siegel" for "Event".

| Column | Type | Notes |
|---|---|---|
| `id` | `INTEGER` PK | autoincrement |
| `attribute_type_id` | `INTEGER` FK → `attribute_types.id` | `ON DELETE CASCADE` |
| `name` | `VARCHAR(100)` | unique within its type (`UNIQUE (attribute_type_id, name)`) |
| `sort_order` | `INTEGER` | order within the type; new options are appended |

`UNIQUE (id, attribute_type_id)` looks redundant, but it exists so that `upload_attributes` can reference an option together with its type (see below).

### `upload_attributes` (`0005`)

The value an image has for an attribute type.

| Column | Type | Notes |
|---|---|---|
| `upload_id` | `INTEGER` FK → `uploads.id` | `ON DELETE CASCADE` |
| `attribute_type_id` | `INTEGER` FK → `attribute_types.id` | `ON DELETE CASCADE` |
| `option_id` | `INTEGER` | with `attribute_type_id`: FK → `attribute_options (id, attribute_type_id)` |

## Rules for attribute values

**At most one value per type** is enforced by the database: the primary key is `(upload_id, attribute_type_id)`. Saving a new value replaces the old one (`INSERT … ON CONFLICT … DO UPDATE`).

**The option must belong to the type**: the composite foreign key `(option_id, attribute_type_id)` rejects an option from a different attribute type.

**At least one value per type cannot be enforced by the database.** When a new attribute type is created, all existing images have no value for it yet. Completeness is therefore checked by the application in `validateAttributeValues` (`lib/attributes.ts`):

- `POST /api/upload`: rejects the request with `400` if any type is missing or invalid. This check runs before anything is written to R2.
- `PUT /api/uploads/[id]/attributes`: requires a valid value for **every** type. This is the Save button on the edit page `/uploads/[id]`.

Images with missing values are flagged in the overview ("Attribute fehlen"). They can't be saved on the edit page until every type has a value.

An attribute type without options blocks both uploading and saving, because no valid value exists.

## Deletion behaviour

| Deleted | Effect |
|---|---|
| Upload | its `upload_tags` and `upload_attributes` rows go with it (cascade); the R2 object is deleted by the API route |
| Tag | its `upload_tags` rows are deleted |
| Attribute type | its options and all image values for it are deleted (the UI asks for confirmation) |
| Attribute option | **refused (`409`) while any image still uses it**; reassign those images first |

## Code

| Area | File |
|---|---|
| D1 HTTP client | `lib/db.ts` |
| Uploads | `services/uploadService.ts`, `types/upload.ts` |
| Tags | `services/tagService.ts`, `types/tag.ts` |
| Attributes | `services/attributeService.ts`, `types/attribute.ts`, `lib/attributes.ts` (validation) |
