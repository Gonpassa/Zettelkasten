import { eq } from 'drizzle-orm'
import { getDb, getRawSqlite } from '../db/client'
import { links } from '../db/schema'
import type { Link, Backlink } from '../../renderer/src/types'

export function insertLink(data: {
  sourceId: string
  targetId: string
  context: string
  createdAt: number
}): Link {
  getDb()
    .insert(links)
    .values(data)
    .run()
  const row = getRawSqlite()
    .prepare('SELECT * FROM links WHERE id = last_insert_rowid()')
    .get() as { id: number; source_id: string; target_id: string; context: string; created_at: number }
  return {
    id: row.id,
    sourceId: row.source_id,
    targetId: row.target_id,
    context: row.context,
    createdAt: row.created_at,
  }
}

export function deleteById(id: number): void {
  getDb().delete(links).where(eq(links.id, id)).run()
}

export function getBacklinks(targetId: string): Backlink[] {
  const stmt = getRawSqlite().prepare(`
    SELECT l.source_id AS sourceId,
           z.title     AS sourceTitle,
           l.context   AS context
    FROM links l
    JOIN zettels z ON z.id = l.source_id
    WHERE l.target_id = ?
      AND z.deleted_at IS NULL
  `)
  return stmt.all(targetId) as Backlink[]
}

export function countActiveBacklinks(targetId: string): number {
  const stmt = getRawSqlite().prepare(`
    SELECT COUNT(*) AS count
    FROM links l
    JOIN zettels z ON z.id = l.source_id
    WHERE l.target_id = ?
      AND z.deleted_at IS NULL
  `)
  return (stmt.get(targetId) as { count: number }).count
}
