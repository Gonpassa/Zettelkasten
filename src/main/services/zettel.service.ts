import * as zettelRepo from '../repositories/zettel.repository'
import * as linkRepo from '../repositories/link.repository'
import type { Zettel, Backlink } from '../../renderer/src/types'

function generateId(): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  let offset = 0
  while (true) {
    const d = new Date(Date.now() + offset * 60_000)
    const id = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`
    if (!zettelRepo.existsById(id)) return id
    offset++
  }
}

export function createZettel(input: {
  title?: string | null
  body?: string
  isStructureNote?: boolean
  references?: string
}): Zettel {
  const id = generateId()
  return zettelRepo.insert({ id, ...input })
}

export function getZettel(id: string): Zettel | undefined {
  return zettelRepo.findById(id)
}

export function updateZettel(input: {
  id: string
  title?: string | null
  body?: string
  isStructureNote?: boolean
  references?: string
}): Zettel | undefined {
  const { id, ...fields } = input
  return zettelRepo.update(id, fields)
}

export function listZettels(): Zettel[] {
  return zettelRepo.findAll()
}

export function searchZettels(query: string): Array<{ id: string; title: string | null; excerpt: string }> {
  return zettelRepo.search(query)
}

export function deleteZettel(
  id: string
): { ok: true } | { ok: false; backlinkCount: number; backlinks: Backlink[] } {
  const backlinkCount = linkRepo.countActiveBacklinks(id)
  if (backlinkCount > 0) {
    const backlinks = linkRepo.getBacklinks(id)
    return { ok: false, backlinkCount, backlinks }
  }
  zettelRepo.softDelete(id)
  return { ok: true }
}
