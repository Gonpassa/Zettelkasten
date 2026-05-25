import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import path from 'node:path'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null
let _sqlite: Database.Database | null = null

export function getDb() {
  if (_db) return _db
  const dbPath = path.join(app.getPath('userData'), 'zettelkasten.db')
  _sqlite = new Database(dbPath)
  _sqlite.pragma('journal_mode = WAL')
  _sqlite.pragma('foreign_keys = ON')
  _db = drizzle(_sqlite, { schema })
  return _db
}

export function getRawSqlite() {
  if (!_sqlite) getDb()
  return _sqlite!
}

export function closeDb() {
  _sqlite?.close()
  _sqlite = null
  _db = null
}
