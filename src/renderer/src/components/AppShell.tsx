import { useEffect } from 'react'
import { css, useTheme } from '@emotion/react'
import { useAppStore } from '../store/app.store'
import { Sidebar } from './sidebar/Sidebar'
import { EditorPane } from './editor/EditorPane'
import { BacklinksPanel } from './backlinks/BacklinksPanel'
import { DeleteConfirmModal } from './modal/DeleteConfirmModal'

export function AppShell() {
  const theme = useTheme()
  const loadList = useAppStore((s) => s.loadList)
  const pendingDelete = useAppStore((s) => s.pendingDelete)
  const cancelDelete = useAppStore((s) => s.cancelDelete)
  const createNote = useAppStore((s) => s.createNote)
  const navigateBack = useAppStore((s) => s.navigateBack)
  const navigateForward = useAppStore((s) => s.navigateForward)

  useEffect(() => {
    loadList()
  }, [loadList])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey && e.key === 'n') {
        e.preventDefault()
        createNote()
      }
      if (e.metaKey && e.key === '[') {
        e.preventDefault()
        navigateBack()
      }
      if (e.metaKey && e.key === ']') {
        e.preventDefault()
        navigateForward()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [createNote, navigateBack, navigateForward])

  return (
    <div
      css={css`
        display: grid;
        grid-template-columns: 280px 1fr 320px;
        grid-template-rows: 100vh;
        width: 100vw;
        overflow: hidden;
        background: ${theme.colors.bg.base};
        color: ${theme.colors.text.primary};
      `}
    >
      <Sidebar />
      <EditorPane />
      <BacklinksPanel />

      {pendingDelete && (
        <DeleteConfirmModal
          backlinks={pendingDelete.backlinks}
          onCancel={cancelDelete}
          onConfirm={cancelDelete}
        />
      )}
    </div>
  )
}
