export const initSql = `
CREATE TABLE IF NOT EXISTS zettels (
  id          TEXT    PRIMARY KEY,
  title       TEXT,
  body        TEXT    NOT NULL DEFAULT '',
  is_structure_note INTEGER NOT NULL DEFAULT 0,
  "references" TEXT   NOT NULL DEFAULT '',
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL,
  deleted_at  INTEGER
);

CREATE VIRTUAL TABLE IF NOT EXISTS zettels_fts USING fts5(
  id    UNINDEXED,
  title,
  body,
  content='zettels',
  content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS zettels_ai AFTER INSERT ON zettels BEGIN
  INSERT INTO zettels_fts(rowid, id, title, body)
  VALUES (new.rowid, new.id, new.title, new.body);
END;

CREATE TRIGGER IF NOT EXISTS zettels_au AFTER UPDATE ON zettels BEGIN
  INSERT INTO zettels_fts(zettels_fts, rowid, id, title, body)
  VALUES ('delete', old.rowid, old.id, old.title, old.body);
  INSERT INTO zettels_fts(rowid, id, title, body)
  VALUES (new.rowid, new.id, new.title, new.body);
END;

CREATE TABLE IF NOT EXISTS links (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id   TEXT    NOT NULL REFERENCES zettels(id),
  target_id   TEXT    NOT NULL REFERENCES zettels(id),
  context     TEXT    NOT NULL,
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_links_source ON links(source_id);
CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_id);
`
