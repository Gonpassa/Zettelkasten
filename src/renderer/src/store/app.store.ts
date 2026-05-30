import { create } from 'zustand'
import type { Zettel, Backlink, ZettelCreateInput, ZettelUpdateInput } from '../types'

type EditorMode = 'edit' | 'preview'

interface AppState {
  zettelList: Zettel[]
  openZettel: Zettel | null
  backlinks: Backlink[]
  editorMode: EditorMode

  navHistory: string[]
  navIndex: number

  pendingDelete: { id: string; backlinks: Backlink[] } | null

  loadList(): Promise<void>
  openZettelById(id: string, opts?: { pushHistory?: boolean }): Promise<void>
  createNote(): Promise<void>
  updateOpenZettel(patch: Partial<Pick<Zettel, 'title' | 'body' | 'isStructureNote' | 'references'>>): Promise<void>
  requestDelete(id: string): Promise<void>
  confirmDelete(): void
  cancelDelete(): void
  setEditorMode(mode: EditorMode): void
  navigateBack(): void
  navigateForward(): void
}

export const useAppStore = create<AppState>((set, get) => ({
  zettelList: [],
  openZettel: null,
  backlinks: [],
  editorMode: 'edit',
  navHistory: [],
  navIndex: -1,
  pendingDelete: null,

  async loadList() {
    const list = await window.api.zettel.list()
    set({ zettelList: list })
  },

  async openZettelById(id, { pushHistory = true } = {}) {
    const zettel = await window.api.zettel.get(id)

    if (!zettel) {
      set((s) => {
        const newHistory = s.navHistory.filter((hid) => hid !== id)
        const newIndex = Math.min(s.navIndex, newHistory.length - 1)
        return { openZettel: null, backlinks: [], navHistory: newHistory, navIndex: newIndex }
      })
      return
    }

    const backlinks = await window.api.link.getBacklinks(id)

    set((s) => {
      let navHistory = s.navHistory
      let navIndex = s.navIndex

      if (pushHistory) {
        navHistory = [...s.navHistory.slice(0, s.navIndex + 1), id]
        navIndex = navHistory.length - 1
      }

      return { openZettel: zettel, backlinks, navHistory, navIndex }
    })
  },

  async createNote() {
    const input: ZettelCreateInput = { title: null, body: '', isStructureNote: false, references: '' }
    const zettel = await window.api.zettel.create(input)
    const list = await window.api.zettel.list()
    set({ zettelList: list, editorMode: 'edit' })
    await get().openZettelById(zettel.id)
  },

  async updateOpenZettel(patch) {
    const { openZettel } = get()
    if (!openZettel) return

    const optimistic: Zettel = { ...openZettel, ...patch }
    set((s) => ({
      openZettel: optimistic,
      zettelList: s.zettelList.map((z) => (z.id === openZettel.id ? optimistic : z)),
    }))

    const input: ZettelUpdateInput = { id: openZettel.id, ...patch }
    const updated = await window.api.zettel.update(input)
    if (updated) {
      set((s) => ({
        openZettel: s.openZettel?.id === updated.id ? updated : s.openZettel,
        zettelList: s.zettelList.map((z) => (z.id === updated.id ? updated : z)),
      }))
    }
  },

  async requestDelete(id) {
    const result = await window.api.zettel.delete(id)

    if (result.ok) {
      set((s) => ({
        zettelList: s.zettelList.filter((z) => z.id !== id),
        openZettel: s.openZettel?.id === id ? null : s.openZettel,
        backlinks: s.openZettel?.id === id ? [] : s.backlinks,
        navHistory: s.navHistory.filter((hid) => hid !== id),
        navIndex: Math.min(
          s.navIndex,
          s.navHistory.filter((hid) => hid !== id).length - 1,
        ),
      }))
    } else {
      set({ pendingDelete: { id, backlinks: result.backlinks } })
    }
  },

  confirmDelete() {
    set({ pendingDelete: null })
  },

  cancelDelete() {
    set({ pendingDelete: null })
  },

  setEditorMode(mode) {
    set({ editorMode: mode })
  },

  navigateBack() {
    const { navIndex, navHistory } = get()
    if (navIndex <= 0) return
    const newIndex = navIndex - 1
    set({ navIndex: newIndex })
    get().openZettelById(navHistory[newIndex], { pushHistory: false })
  },

  navigateForward() {
    const { navIndex, navHistory } = get()
    if (navIndex >= navHistory.length - 1) return
    const newIndex = navIndex + 1
    set({ navIndex: newIndex })
    get().openZettelById(navHistory[newIndex], { pushHistory: false })
  },
}))
