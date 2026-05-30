import { css, useTheme } from '@emotion/react'
import { NewNoteButton } from './NewNoteButton'
import { NoteList } from './NoteList'

export function Sidebar() {
  const theme = useTheme()
  return (
    <aside
      css={css`
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
        background: ${theme.colors.bg.sunken};
        border-right: 1px solid ${theme.colors.border.subtle};
      `}
    >
      <div
        css={css`
          padding: 12px;
          flex-shrink: 0;
        `}
      >
        <NewNoteButton />
      </div>
      <div css={css`flex: 1; overflow-y: auto; min-height: 0;`}>
        <NoteList />
      </div>
    </aside>
  )
}
