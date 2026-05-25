# Implementation Plan: Zettelkasten App

> High-level phased plan. Each phase will have its own granular breakdown doc.
> Decisions sourced from `design-spec.md`.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Desktop shell | Electron | Installable macOS app, SQLite in main process |
| Build tool | `electron-vite` | Vite-based, standard Electron tooling, fast HMR |
| Frontend | React 18 + TypeScript | Existing stack |
| Styling | Emotion CSS (`@emotion/react`) | CSS-in-JS, scoped styles, theme provider, design token utilities |
| SQLite driver | `better-sqlite3` | Synchronous, ideal for Electron main process |
| ORM / query | Drizzle ORM | Lightweight, type-safe, SQLite-native, easy Postgres migration later |
| Markdown editor | CodeMirror 6 | Extensible, lightweight, keyboard-friendly |
| Markdown render | `react-markdown` + `remark` | Standard, composable plugin system |
| State management | Zustand | Minimal, no boilerplate |
| Linting | ESLint (flat config) | Airbnb rules + TypeScript + React hooks + Prettier compat |
| Formatting | Prettier | Default config, enforced via `eslint-config-prettier` |

---

## Folder Architecture

```
zettelkasten/
├── src/
│   ├── main/                          # Electron main process (Node.js)
│   │   ├── index.ts                   # App entry, BrowserWindow creation
│   │   ├── db/
│   │   │   ├── client.ts              # SQLite connection singleton
│   │   │   ├── schema.ts              # Drizzle table definitions
│   │   │   └── migrations/            # SQL migration files
│   │   ├── repositories/              # Raw DB access, one file per entity
│   │   │   ├── zettel.repository.ts
│   │   │   └── link.repository.ts
│   │   ├── services/                  # Business logic, composes repositories
│   │   │   ├── zettel.service.ts
│   │   │   ├── link.service.ts
│   │   │   └── export.service.ts
│   │   └── ipc/
│   │       ├── channels.ts            # Channel name constants (shared source of truth)
│   │       └── handlers.ts            # IPC handler registration (calls services)
│   ├── preload/
│   │   └── index.ts                   # contextBridge — exposes IPC to renderer safely
│   └── renderer/                      # React app (runs in Chromium)
│       ├── main.tsx                   # React entry point
│       ├── App.tsx                    # Root layout, routing
│       ├── components/
│       │   ├── editor/
│       │   │   ├── ZettelEditor.tsx   # CodeMirror instance + toolbar
│       │   │   ├── MarkdownPreview.tsx
│       │   │   └── LinkInserter.tsx   # [[link]] picker + context modal
│       │   ├── sidebar/
│       │   │   ├── Sidebar.tsx
│       │   │   └── NoteList.tsx
│       │   ├── backlinks/
│       │   │   └── BacklinksPanel.tsx
│       │   └── search/
│       │       └── SearchPalette.tsx  # Cmd+K quick-open
│       ├── hooks/
│       │   ├── useZettel.ts
│       │   ├── useLinks.ts
│       │   └── useSearch.ts
│       ├── store/
│       │   └── app.store.ts           # Zustand — open note, nav history, UI state
│       ├── design-system/
│       │   ├── index.ts               # Re-exports all tokens
│       │   ├── tokens/
│       │   │   ├── spacing.ts         # padding.* and margin.* utilities
│       │   │   ├── shadows.ts         # shadow.sm / md / lg / xl
│       │   │   ├── radius.ts          # radius.sm / md / lg / full
│       │   │   └── colors.ts          # Semantic color palette (light + dark)
│       │   └── theme.ts               # Emotion ThemeProvider shape
│       └── types/
│           └── index.ts               # Shared domain types (Zettel, Link, Backlink)
├── electron.vite.config.ts
├── eslint.config.js                   # Flat config — Airbnb + TS + React + Prettier
├── package.json
└── tsconfig.json
```

---

## Data Definitions

### TypeScript Types (`src/renderer/types/index.ts`)

```ts
interface Zettel {
  id: string              // YYYYMMDDHHmm — immutable after creation
  title: string | null
  body: string            // Markdown source
  isStructureNote: boolean
  references: string      // Free-form plain text
  createdAt: number       // Unix ms
  updatedAt: number
  deletedAt: number | null  // null = active, number = soft-deleted
}

interface Link {
  id: number
  sourceId: string
  targetId: string
  context: string         // Required — cannot be empty
  createdAt: number
}

interface Backlink {
  sourceId: string
  sourceTitle: string | null
  context: string
}
```

### SQLite Schema (`src/main/db/schema.ts`)

```sql
-- Notes
CREATE TABLE zettels (
  id          TEXT    PRIMARY KEY,      -- '202506110955'
  title       TEXT,
  body        TEXT    NOT NULL DEFAULT '',
  is_structure_note INTEGER NOT NULL DEFAULT 0,
  references  TEXT    NOT NULL DEFAULT '',
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  deleted_at  INTEGER                   -- soft delete
);

-- Full-text search index (FTS5)
CREATE VIRTUAL TABLE zettels_fts USING fts5(
  id    UNINDEXED,
  title,
  body,
  content='zettels',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER zettels_ai AFTER INSERT ON zettels BEGIN
  INSERT INTO zettels_fts(rowid, id, title, body)
  VALUES (new.rowid, new.id, new.title, new.body);
END;

CREATE TRIGGER zettels_au AFTER UPDATE ON zettels BEGIN
  INSERT INTO zettels_fts(zettels_fts, rowid, id, title, body)
  VALUES ('delete', old.rowid, old.id, old.title, old.body);
  INSERT INTO zettels_fts(rowid, id, title, body)
  VALUES (new.rowid, new.id, new.title, new.body);
END;

-- Links (with required context)
CREATE TABLE links (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id   TEXT    NOT NULL REFERENCES zettels(id),
  target_id   TEXT    NOT NULL REFERENCES zettels(id),
  context     TEXT    NOT NULL,
  created_at  INTEGER NOT NULL
);

CREATE INDEX idx_links_source ON links(source_id);
CREATE INDEX idx_links_target ON links(target_id);
```

### IPC Channels (`src/main/ipc/channels.ts`)

```ts
export const IPC = {
  ZETTEL_CREATE:      'zettel:create',
  ZETTEL_GET:         'zettel:get',
  ZETTEL_UPDATE:      'zettel:update',
  ZETTEL_DELETE:      'zettel:delete',     // returns backlink count if > 0
  ZETTEL_LIST:        'zettel:list',
  ZETTEL_SEARCH:      'zettel:search',
  LINK_CREATE:        'link:create',
  LINK_DELETE:        'link:delete',
  LINK_GET_BACKLINKS: 'link:getBacklinks',
  EXPORT_ALL:         'export:all',
} as const
```

---

## Linting & Formatting

### ESLint (`eslint.config.js`)

Flat config format. Mirrors the setup from the harmonee project.

**Packages:**
```
eslint
@eslint/js
typescript-eslint
eslint-config-airbnb
eslint-plugin-react
eslint-plugin-react-hooks
eslint-plugin-react-refresh
eslint-plugin-import
eslint-plugin-jsx-a11y
eslint-config-prettier
globals
```

**Config shape:**
```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'out'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      'airbnb',
      'airbnb/hooks',
      'plugin:react-refresh/recommended',
      'prettier',              // must be last — disables rules that conflict with Prettier
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
)
```

### Prettier

No `.prettierrc` — uses Prettier defaults. `eslint-config-prettier` (the `'prettier'` extend above) handles the ESLint/Prettier boundary so they never conflict.

**Scripts in `package.json`:**
```json
"lint": "eslint .",
"format": "prettier --write ."
```

---

## Design Tokens (`src/renderer/design-system/`)

All tokens are plain TypeScript objects that return Emotion-compatible CSS strings. Components import and spread them directly into `css` tagged templates or style objects.

---

### Spacing — Padding & Margin

Scale runs from `0.25rem` to `2rem` in `0.25rem` steps.

**Naming convention:** `p{value}` where decimals use `point` — e.g. `p1point25` = `1.25rem`.
Sub-1 values: `p0point25`, `p0point5`, `p0point75`.

**Axis prefixes:**

| Prefix | Properties |
|---|---|
| `a` | all four sides |
| `y` | top + bottom |
| `x` | left + right |
| `yt` | top only |
| `yb` | bottom only |
| `xl` | left only |
| `xr` | right only |

**Usage:**
```ts
import { padding, margin } from '@/design-system'
import { css } from '@emotion/react'

const style = css`
  ${padding.y.p1}
  ${padding.x.p1point5}
  ${margin.yt.p0point5}
`
```

**Token values:**

| Token key | rem value |
|---|---|
| `p0point25` | 0.25rem |
| `p0point5` | 0.5rem |
| `p0point75` | 0.75rem |
| `p1` | 1rem |
| `p1point25` | 1.25rem |
| `p1point5` | 1.5rem |
| `p1point75` | 1.75rem |
| `p2` | 2rem |

The same keys apply to every axis prefix. `margin` exposes the identical structure with `margin-*` properties.

---

### Shadows (`src/renderer/design-system/tokens/shadows.ts`)

```ts
shadow.none  // box-shadow: none
shadow.sm    // subtle lift — cards, panels
shadow.md    // moderate depth — dropdowns, popovers
shadow.lg    // strong depth — modals
shadow.xl    // maximum — floating command palette
shadow.inner // inset shadow — pressed states, inputs
```

---

### Border Radius (`src/renderer/design-system/tokens/radius.ts`)

```ts
radius.none   // 0
radius.sm     // 4px  — tags, badges
radius.md     // 8px  — buttons, inputs
radius.lg     // 12px — cards, panels
radius.xl     // 16px — modals, large surfaces
radius.full   // 9999px — pills, avatars
```

---

### Color Palette (`src/renderer/design-system/tokens/colors.ts`)

Semantic names only — no raw hex values in components. The theme provider maps semantic names to actual values for light and dark themes.

**Surfaces & backgrounds:**
```
colors.bg.base          // app background
colors.bg.surface       // cards, panels (slightly elevated)
colors.bg.overlay       // modals, popovers (topmost)
colors.bg.sunken        // inset areas, sidebars
```

**Text:**
```
colors.text.primary     // main readable text
colors.text.secondary   // supporting labels
colors.text.muted       // placeholders, timestamps
colors.text.disabled    // inactive elements
colors.text.inverse     // text on accent backgrounds
```

**Borders:**
```
colors.border.subtle    // dividers, panel edges
colors.border.default   // inputs, cards
colors.border.strong    // focused inputs, emphasis
```

**Accent (interactive):**
```
colors.accent.default   // primary buttons, links, active states
colors.accent.hover     // hover variant
colors.accent.muted     // tinted backgrounds (selected row)
```

**Semantic states:**
```
colors.danger.default   // destructive actions (delete)
colors.danger.muted     // danger tinted background
colors.success.default
colors.success.muted
```

---

### Theme Provider

Emotion's `ThemeProvider` wraps the app root. Components access the theme via `useTheme()`. Light and dark theme objects both satisfy the same `Theme` interface — toggling themes is a single provider swap with no component changes.

```ts
// theme.ts
interface Theme {
  colors: typeof lightColors  // same shape for dark
}
```

---

## Phases

---

### Phase 1 — Project Scaffolding

**Goal:** Working Electron + React + TypeScript app with SQLite connected and the dev environment running.

- Initialize project with `electron-vite` (React + TypeScript template)
- Install and configure ESLint (flat config) and Prettier — add `lint` and `format` scripts
- Install and configure `@emotion/react` — wrap app root in `ThemeProvider`
- Implement the full design token system (`spacing`, `shadows`, `radius`, `colors`) under `src/renderer/design-system/`
- Define light theme color values; dark theme stubbed for later
- Set up `better-sqlite3` + Drizzle in the main process
- Create the DB connection singleton and run the initial schema migration on app start
- Set up the preload script with `contextBridge` skeleton
- Verify: app opens a window, DB file is created on disk, design tokens accessible in a test component, no console errors

---

### Phase 2 — Data Layer (Main Process)

**Goal:** All DB operations implemented and callable via IPC. No UI yet.

- Implement `zettel.repository.ts` — CRUD + soft delete + FTS5 search queries
- Implement `link.repository.ts` — create link, delete link, get backlinks by target ID
- Implement `zettel.service.ts` — ID generation (`YYYYMMDDHHmm`), delete guard (check backlink count before deleting), orchestrates repository calls
- Implement `link.service.ts` — enforces non-empty context before writing
- Implement `export.service.ts` — dumps all active Zettels to `.md` files via Electron's `dialog.showOpenDialog`
- Register all IPC handlers in `handlers.ts`
- Verify: invoke each IPC channel from DevTools console and confirm correct DB reads/writes

---

### Phase 3 — Core Frontend Shell

**Goal:** App layout, navigation, and Zettel CRUD working end-to-end.

- Build the main layout: sidebar (note list) + main content area + backlinks panel
- Sidebar: list all Zettels, click to open, "New Note" button
- Zustand store: `openZettelId`, navigation history stack (forward/back)
- Zettel editor: CodeMirror 6 with Markdown syntax highlighting, edit/preview toggle
- Wire create, save (auto-save on change with debounce), and delete flows to IPC
- Delete confirmation modal — if backlinks exist, list them by title before allowing deletion
- Verify: create notes, edit them, delete with and without backlinks, navigate history

---

### Phase 4 — Linking System

**Goal:** Full link creation flow with required context, and backlinks panel populated.

- `[[` trigger in CodeMirror opens the `LinkInserter` picker — search notes by title/body
- Selecting a note opens a context modal (textarea, cannot submit empty)
- On confirm: inserts `[[zettel-id]]` syntax into the editor body and writes the link record to DB
- Clicking a `[[zettel-id]]` in preview or editor navigates to that note
- Backlinks panel renders all inbound links with source title and context snippet
- Verify: create two notes, link them with context, navigate via link, confirm backlinks panel

---

### Phase 5 — Search

**Goal:** Fast full-text search accessible from anywhere in the app.

- `Cmd+K` opens `SearchPalette` — modal overlay, autofocused input
- Queries `zettel:search` IPC channel (FTS5 under the hood) on each keystroke (debounced)
- Results show title + body excerpt with match highlighted
- Enter or click navigates to the note and closes the palette
- Escape closes without navigating
- Verify: search across 20+ notes, confirm results are fast and accurate

---

### Phase 6 — Export

**Goal:** One-command Markdown export of all notes.

- Menu item or button triggers `export:all` IPC
- Electron opens a folder picker dialog
- Export service writes one `.md` file per active Zettel, filename = `{id}-{slug-of-title}.md`
- Frontmatter includes `id`, `created_at`, `is_structure_note`, `references`
- Outgoing links are preserved as `[[id]]` syntax in the body
- Verify: export, open a file in any text editor, confirm it is readable and complete

---

### Phase 7 (v2) — Mind Map View

**Goal:** Spatial, clustered visualization of the note graph. Deferred to v2.

- Interactive canvas (candidate library: `react-flow` or `d3` with custom layout)
- Nodes represent Zettels, edges represent links
- Layout algorithm groups densely connected notes into visible clusters (not force-directed — more like a mind map with hierarchical spreading from Structure Notes)
- Click a node to open the note
- Zoom and pan to explore
- Structure Notes rendered as larger anchor nodes

---

## Milestone Summary

| Phase | Deliverable | Dependency |
|---|---|---|
| 1 | Scaffold + DB connected | — |
| 2 | Full data layer + IPC | Phase 1 |
| 3 | CRUD UI + navigation | Phase 2 |
| 4 | Linking + backlinks | Phase 3 |
| 5 | Search palette | Phase 2 |
| 6 | Markdown export | Phase 2 |
| 7 | Mind map view (v2) | Phases 3–4 |

---

*Last updated: 2026-05-24*
