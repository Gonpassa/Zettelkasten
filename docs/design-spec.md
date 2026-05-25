# Design Spec: Zettelkasten Application

> Based on the article in `idea.md` (Sascha, 2020). This document is a living spec — open questions below must be answered by the engineer before implementation begins.

---

## 1. Overview

Build a personal knowledge management application that implements the Zettelkasten method: a networked note-taking system where individual atomic notes (Zettel) are linked together to form a web of interconnected knowledge, rather than a hierarchical folder structure.

The system is not a simple note app — it is a **thinking tool**. Its core value is in the connections between notes, not the notes themselves.

---

## 2. Core Concepts (Domain Model)

### Zettel (Note)
The atomic unit. Each Zettel contains:
- **ID** — a unique, permanent, immutable identifier
- **Body** — the knowledge content, written in the user's own words (one idea per note)
- **References** — citations to external sources (books, articles, URLs)
- **Links** — connections to other Zettels, each with explicit context explaining *why* the link exists

### Link Context
A link is not just a pointer. It must include a sentence or phrase explaining the relationship. This is where knowledge is created. Example:
> `[[202506110955]]` — contrasts with this idea because it assumes scarcity rather than abundance

### Structure Note
A meta-note whose body is a curated, annotated list of links to other Zettels on a topic. Acts as a table of contents / entry point for a cluster of knowledge. Not a folder — it is itself a Zettel.

### ID
A stable address for every note. Two candidate schemes:
- **Time-based**: `202506110955` (YYYYMMDDHHmm) — automatically generated, globally unique
- **Luhmann-style**: `1`, `1a`, `1b`, `1a1` — hierarchical, expresses the branching origin of a thought

---

## 3. Functional Requirements

### 3.1 Note Management
- Create, edit, delete Zettels
- Each Zettel has: ID, title (optional), body, references list, outgoing links
- Body supports rich text or plain markup (see Q2)
- Deleting a Zettel must warn the user of all incoming links (orphan prevention)

### 3.2 Linking
- Insert a link to another Zettel by ID or by searching title/body
- Each link requires a context annotation (enforced or optional — see Q7)
- Clicking a link navigates to the target Zettel
- Backlinks panel: every Zettel displays all other Zettels that link to it, with their context snippets

### 3.3 Search
- Full-text search across all note bodies, titles, references
- Filter by tags (if tags are supported — see Q8)
- Results should rank notes by link count / centrality (stretch goal)

### 3.4 Structure Notes
- A Zettel can be designated as a Structure Note
- Structure Notes render their body as a navigable outline of links
- Entry-point index: a root Structure Note that links to all major topic clusters

### 3.5 Navigation
- Open any Zettel by ID directly
- Sidebar or palette for quick search and jump
- Forward / back navigation history within a session
- Link graph view (see Q9)

### 3.6 References
- Each Zettel has a reference list (bibliographic citations or URLs)
- References are plain text or a structured format (see Q10)

### 3.7 ID Management
- IDs are auto-generated on note creation (time-based default)
- IDs are immutable after creation
- ID scheme configurable at project setup (see Q4)

---

## 4. Non-Functional Requirements

- **Single-user** (Zettelkasten is inherently personal — one per person)
- **Durability**: Notes must never be silently lost. All deletes are soft-deleted or confirmed.
- **Portability**: On-demand export to one Markdown file per note, human-readable without the app
- **Speed**: Search and link traversal must feel instant for collections up to ~10,000 notes
- **Offline-first**: Guaranteed by Electron — no network dependency in the core app

---

## 5. Out of Scope (for v1)

- Multi-device sync / cloud storage
- Collaboration / multi-user
- AI-powered semantic search or auto-linking
- Native mobile app (unless answered otherwise in Q6)
- Plugin system
- Publishing / sharing notes publicly

---

## 5a. Future Work

### Migrate storage to Postgres for cloud sync
When multi-device sync becomes a requirement, the path is:
1. **Abstract the data layer now** — all DB access goes through a service/repository layer; no raw SQL scattered in route handlers. This makes the swap mechanical.
2. **Swap SQLite → Postgres** — SQL dialects are close; the schema migrates with minimal changes. Use a migration tool (e.g., Drizzle, Prisma, or raw SQL migrations).
3. **Add auth** — sessions or JWT; the app currently has none.
4. **Add conflict resolution** — decide on a strategy (last-write-wins by `updated_at` timestamp is the simplest starting point).
5. **Data migration** — one-time script to import the user's existing SQLite file into the cloud DB.

*Prerequisite: the data access layer must be kept clean from day one to make step 1 trivial.*

---

## 6. Open Questions — Engineer Decisions Required

Answer each question below. No default will be assumed until answered.

---

**Q1 — Platform**
~~Decision: **Electron desktop app** — ships as an installable macOS app. Renderer process is React + TypeScript (identical to web). SQLite runs directly in the main process with no server or network layer. Offline-first by default.~~

---

**Q2 — Content Format**
What format should the note body use?
- (b) Markdown with a rendered preview

*Engineering impact: editor library choice, storage format, export capability.*

---

**Q3 — Storage Layer**
~~Decision: **SQLite** — single local file, FTS5 for full-text search, fast backlink queries via indexed joins. Backup = copy one file. Portability = on-demand Markdown export (one `.md` file per note).~~

---

**Q4 — ID Scheme**
Which ID system should be the default?
- (a) Time-based (`202506110955`) — auto-generated, no thinking required

*Engineering impact: ID generation logic, display, URL routing if web.*

---

**Q5 — Sync / Multi-device**
~~Decision: **Not in v1** — local SQLite only. See Future Work for the migration path.~~

---

**Q6 — Mobile**
Is a mobile (iOS/Android) experience required, even read-only?
- (a) No, desktop/web only

*Engineering impact: major scope increase if yes.*

---

**Q7 — Link Context Enforcement**
Should the app *require* link context annotations, or just encourage them?
- (a) Required — cannot save a link without a context note

*Engineering impact: UX friction vs. method fidelity tradeoff.*

---

**Q8 — Tags**
Should Zettels support tags in addition to links?
- (a) No tags — links and Structure Notes are the only organization mechanism (strict Zettelkasten)

*Engineering impact: data model, search UI, filter UI.*

---

**Q9 — Graph Visualization**
Should there be a visual graph of note connections?
- (c) Stretch goal for v2 - it should not be a graph, but rather a map view with clusters of notes and links, more like a mind map than a force-directed graph if possible. The graph should be interactive, allowing users to click on nodes to navigate to notes, and zoom/pan to explore clusters of related notes.

*Engineering impact: significant frontend complexity if yes; requires a graph rendering library.*

---

**Q10 — Reference / Citation Format**
How should external references be stored?
- (a) Free-form plain text (user types whatever they want)

*Engineering impact: determines whether a citation schema or parser is needed.*

---

**Q11 — Tech Stack Preferences**
Do you have preferences or constraints on languages / frameworks?
- Frontend: React, Vue, Svelte, SwiftUI, other?
- Backend (if any): Node, Python, Go, Rust, other?
- Any frameworks / libraries already decided?

---

## 7. Verification Plan (post-implementation)

Once built, the following flows must work end-to-end:

1. Create a new Zettel → ID is auto-assigned → body is saved
2. Create a second Zettel → add a link to the first with a context annotation → navigate via the link
3. Open the first Zettel → backlinks panel shows the second Zettel with its context
4. Full-text search returns correct notes
5. Create a Structure Note → body lists links to 3 Zettels → clicking each navigates correctly
6. Delete a Zettel that has incoming links → user is warned before deletion proceeds
7. Export all notes → resulting files are human-readable without the app

---

*Last updated: 2026-05-24*
