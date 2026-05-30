import * as linkRepo from '../repositories/link.repository'
import type { Link, Backlink } from '../../renderer/src/types'

export function createLink(input: {
  sourceId: string
  targetId: string
  context: string
}): Link {
  if (!input.context || !input.context.trim()) throw new Error('Link context cannot be empty')

  return linkRepo.insertLink({ ...input, createdAt: Date.now() })
}

export function deleteLink(id: number): void {
  linkRepo.deleteById(id)
}

export function getBacklinks(targetId: string): Backlink[] {
  return linkRepo.getBacklinks(targetId)
}
