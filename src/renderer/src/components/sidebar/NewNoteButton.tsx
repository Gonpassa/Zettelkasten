import { css, useTheme } from '@emotion/react'
import { useAppStore } from '../../store/app.store'

export function NewNoteButton() {
  const theme = useTheme()
  const createNote = useAppStore((s) => s.createNote)
  return (
    <button
      onClick={() => createNote()}
      css={css`
        width: 100%;
        padding: 8px 12px;
        background: ${theme.colors.accent.default};
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        &:hover { opacity: 0.9; }
      `}
    >
      + New Note
    </button>
  )
}
