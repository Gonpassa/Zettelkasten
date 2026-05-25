import { getRawSqlite } from './client'
import { initSql } from './migrations/0001_init'

export function runMigrations() {
  const sqlite = getRawSqlite()
  const row = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='zettels'")
    .get()
  if (row) return
  sqlite.exec(initSql)
}
