import { css, useTheme } from '@emotion/react'
import { useAppStore } from '../../store/app.store'

interface Props {
  title: string
  onTitleChange: (v: string) => void
}

export function EditorToolbar({ title, onTitleChange }: Props) {
  const theme = useTheme()
  const openZettel = useAppStore((s) => s.openZettel)
  const editorMode = useAppStore((s) => s.editorMode)
  const setEditorMode = useAppStore((s) => s.setEditorMode)
  const requestDelete = useAppStore((s) => s.requestDelete)
  const navigateBack = useAppStore((s) => s.navigateBack)
  const navigateForward = useAppStore((s) => s.navigateForward)
  const navIndex = useAppStore((s) => s.navIndex)
  const navHistory = useAppStore((s) => s.navHistory)

  const canBack = navIndex > 0
  const canForward = navIndex < navHistory.length - 1

  const btnBase = css`
    padding: 4px 10px;
    border: 1px solid ${theme.colors.border.subtle};
    border-radius: 4px;
    background: transparent;
    color: ${theme.colors.text.primary};
    font-size: 0.8125rem;
    cursor: pointer;
    &:disabled { opacity: 0.4; cursor: default; }
    &:hover:not(:disabled) { background: #f3f4f6; /* TODO: add bg.hover token */ }
  `

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-bottom: 1px solid ${theme.colors.border.subtle};
        flex-shrink: 0;
      `}
    >
      <button css={btnBase} onClick={navigateBack} disabled={!canBack} aria-label="Go back">
        ←
      </button>
      <button css={btnBase} onClick={navigateForward} disabled={!canForward} aria-label="Go forward">
        →
      </button>

      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Untitled"
        css={css`
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 1rem;
          font-weight: 600;
          color: ${theme.colors.text.primary};
          &::placeholder { color: ${theme.colors.text.muted}; }
        `}
      />

      <span
        css={css`
          font-size: 0.75rem;
          color: ${theme.colors.text.muted};
          font-family: monospace;
        `}
      >
        {openZettel?.id}
      </span>

      <button
        css={btnBase}
        onClick={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')}
      >
        {editorMode === 'edit' ? 'Preview' : 'Edit'}
      </button>

      <button
        css={css`
          padding: 4px 10px;
          border: 1px solid ${theme.colors.danger.default};
          border-radius: 4px;
          background: transparent;
          color: ${theme.colors.danger.default};
          font-size: 0.8125rem;
          cursor: pointer;
          &:hover { background: ${theme.colors.danger.muted}; }
        `}
        onClick={() => openZettel && requestDelete(openZettel.id)}
      >
        Delete
      </button>
    </div>
  )
}
