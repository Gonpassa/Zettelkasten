import { contextBridge, ipcRenderer } from 'electron'
import type { Zettel, Backlink } from '../renderer/src/types'

const IPC = {
  ZETTEL_CREATE:      'zettel:create',
  ZETTEL_GET:         'zettel:get',
  ZETTEL_UPDATE:      'zettel:update',
  ZETTEL_DELETE:      'zettel:delete',
  ZETTEL_LIST:        'zettel:list',
  ZETTEL_SEARCH:      'zettel:search',
  LINK_CREATE:        'link:create',
  LINK_DELETE:        'link:delete',
  LINK_GET_BACKLINKS: 'link:getBacklinks',
  EXPORT_ALL:         'export:all',
} as const

const api = {
  zettel: {
    create: (input: { title?: string | null; body?: string; isStructureNote?: boolean; references?: string }): Promise<Zettel> =>
      ipcRenderer.invoke(IPC.ZETTEL_CREATE, input),
    get: (id: string): Promise<Zettel | undefined> =>
      ipcRenderer.invoke(IPC.ZETTEL_GET, id),
    update: (input: { id: string; title?: string | null; body?: string; isStructureNote?: boolean; references?: string }): Promise<Zettel | undefined> =>
      ipcRenderer.invoke(IPC.ZETTEL_UPDATE, input),
    delete: (id: string): Promise<{ ok: true } | { ok: false; backlinkCount: number; backlinks: Backlink[] }> =>
      ipcRenderer.invoke(IPC.ZETTEL_DELETE, id),
    list: (): Promise<Zettel[]> =>
      ipcRenderer.invoke(IPC.ZETTEL_LIST),
    search: (query: string): Promise<{ id: string; title: string | null; excerpt: string }[]> =>
      ipcRenderer.invoke(IPC.ZETTEL_SEARCH, query),
  },
  link: {
    create: (input: { sourceId: string; targetId: string; context: string }): Promise<{ id: number; sourceId: string; targetId: string; context: string; createdAt: number }> =>
      ipcRenderer.invoke(IPC.LINK_CREATE, input),
    delete: (id: number): Promise<void> =>
      ipcRenderer.invoke(IPC.LINK_DELETE, id),
    getBacklinks: (targetId: string): Promise<Backlink[]> =>
      ipcRenderer.invoke(IPC.LINK_GET_BACKLINKS, targetId),
  },
  export: {
    all: (): Promise<void> =>
      ipcRenderer.invoke(IPC.EXPORT_ALL),
  },
} as const

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.api = api
}

export type Api = typeof api
