import { dialog } from 'electron'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as zettelRepo from '../repositories/zettel.repository'

export async function exportAll(): Promise<void> {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (result.canceled || result.filePaths.length === 0) return
  const outputDir = result.filePaths[0]
  for (const zettel of zettelRepo.findAll()) {
    writeFileSync(join(outputDir, `${zettel.id}.md`), zettel.body, 'utf-8')
  }
}
