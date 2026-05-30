import { ipcMain } from 'electron'
import { IPC } from './channels'
import * as zettelService from '../services/zettel.service'
import * as linkService from '../services/link.service'
import { exportAll } from '../services/export.service'

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC.ZETTEL_CREATE,     (_e, input)    => zettelService.createZettel(input))
  ipcMain.handle(IPC.ZETTEL_GET,         (_e, id)       => zettelService.getZettel(id))
  ipcMain.handle(IPC.ZETTEL_UPDATE,      (_e, input)    => zettelService.updateZettel(input))
  ipcMain.handle(IPC.ZETTEL_DELETE,      (_e, id)       => zettelService.deleteZettel(id))
  ipcMain.handle(IPC.ZETTEL_LIST,        ()             => zettelService.listZettels())
  ipcMain.handle(IPC.ZETTEL_SEARCH,      (_e, query)    => zettelService.searchZettels(query))
  ipcMain.handle(IPC.LINK_CREATE,        (_e, input)    => linkService.createLink(input))
  ipcMain.handle(IPC.LINK_DELETE,        (_e, id)       => linkService.deleteLink(id))
  ipcMain.handle(IPC.LINK_GET_BACKLINKS, (_e, targetId) => linkService.getBacklinks(targetId))
  ipcMain.handle(IPC.EXPORT_ALL,         ()             => exportAll())
}
