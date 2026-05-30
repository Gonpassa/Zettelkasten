import { eq, isNull, desc } from 'drizzle-orm'
import { getDb, getRawSqlite } from '../db/client'
import { zettels } from '../db/schema'
import type { Zettel } from '../../renderer/src/types'

export function findById(id: string): Zettel | undefined {
  return getDb()
    .select()
    .from(zettels)
    .where(eq(zettels.id, id))
    .get() as Zettel | undefined
}

export function findAll(): Zettel[] {
  return getDb()
    .select()
    .from(zettels)
    .where(isNull(zettels.deletedAt))
    .orderBy(desc(zettels.createdAt))
    .all() as Zettel[]
}

export function insert(data: {
  id: string
  title?: string | null
  body?: string
  isStructureNote?: boolean
  references?: string
}): Zettel {
  const now = Date.now()
  getDb()
    .insert(zettels)
    .values({
      id: data.id,
      title: data.title ?? null,
      body: data.body ?? '',
      isStructureNote: data.isStructureNote ?? false,
      references: data.references ?? '',
      createdAt: now,
      updatedAt: now,
    })
    .run()
  return findById(data.id)!
}

export function update(
  id: string,
  fields: Partial<Pick<Zettel, 'title' | 'body' | 'isStructureNote' | 'references'>>
): Zettel | undefined {
  getDb()
    .update(zettels)
    .set({ ...fields, updatedAt: Date.now() })
    .where(eq(zettels.id, id))
    .run()
  return findById(id)
}

export function softDelete(id: string): void {
  getDb()
    .update(zettels)
    .set({ deletedAt: Date.now() })
    .where(eq(zettels.id, id))
    .run()
}

export function existsById(id: string): boolean {
  const row = getDb()
    .select({ id: zettels.id })
    .from(zettels)
    .where(eq(zettels.id, id))
    .get()
  return row !== undefined
}

export function search(query: string): Array<{ id: string; title: string | null; excerpt: string }> {
  const stmt = getRawSqlite().prepare(`
    SELECT z.id, z.title,
      snippet(zettels_fts, 2, '<mark>', '</mark>', '…', 16) AS excerpt
    FROM zettels_fts
    JOIN zettels z ON z.rowid = zettels_fts.rowid
    WHERE zettels_fts MATCH ?
      AND z.deleted_at IS NULL
    ORDER BY rank
    LIMIT 50
  `)
  return stmt.all(query) as Array<{ id: string; title: string | null; excerpt: string }>
}
