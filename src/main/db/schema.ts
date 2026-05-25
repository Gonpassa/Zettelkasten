import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const zettels = sqliteTable('zettels', {
  id: text('id').primaryKey(),
  title: text('title'),
  body: text('body').notNull().default(''),
  isStructureNote: integer('is_structure_note', { mode: 'boolean' }).notNull().default(false),
  references: text('references').notNull().default(''),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
})

export const links = sqliteTable('links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceId: text('source_id').notNull().references(() => zettels.id),
  targetId: text('target_id').notNull().references(() => zettels.id),
  context: text('context').notNull(),
  createdAt: integer('created_at').notNull(),
})
