export interface Zettel {
  id: string
  title: string | null
  body: string
  isStructureNote: boolean
  references: string
  createdAt: number
  updatedAt: number
  deletedAt: number | null
}

export interface Link {
  id: number
  sourceId: string
  targetId: string
  context: string
  createdAt: number
}

export interface Backlink {
  sourceId: string
  sourceTitle: string | null
  context: string
}

export type ZettelCreateInput = {
  title?: string | null
  body?: string
  isStructureNote?: boolean
  references?: string
}

export type ZettelUpdateInput = {
  id: string
  title?: string | null
  body?: string
  isStructureNote?: boolean
  references?: string
}

export type DeleteResult =
  | { ok: true }
  | { ok: false; backlinkCount: number; backlinks: Backlink[] }
