import { css, useTheme } from '@emotion/react'
import type { Zettel } from '../../types'

interface Props {
  zettel: Zettel
  isActive: boolean
  onClick: () => void
}

export function NoteListItem({ zettel, isActive, onClick }: Props) {
  const theme = useTheme()
  return (
    <li>
      <button
        onClick={onClick}
        css={css`
          display: block;
          width: 100%;
          padding: 8px 16px;
          text-align: left;
          background: ${isActive ? theme.colors.accent.muted : 'transparent'};
          border: none;
          border-left: 3px solid ${isActive ? theme.colors.accent.default : 'transparent'};
          font-size: 0.875rem;
          color: ${theme.colors.text.primary};
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          &:hover {
            background: #f3f4f6; /* TODO: add bg.hover token */
          }
        `}
      >
        {zettel.title ?? '(untitled)'}
      </button>
    </li>
  )
}
