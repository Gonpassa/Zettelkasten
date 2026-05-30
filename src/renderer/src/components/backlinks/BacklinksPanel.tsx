import { css, useTheme } from '@emotion/react'
import { useAppStore } from '../../store/app.store'

export function BacklinksPanel() {
  const theme = useTheme()
  const backlinks = useAppStore((s) => s.backlinks)
  const openZettelById = useAppStore((s) => s.openZettelById)

  return (
    <aside
      css={css`
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow-y: auto;
        border-left: 1px solid ${theme.colors.border.subtle};
        background: ${theme.colors.bg.base};
        padding: 16px;
      `}
    >
      <h3
        css={css`
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: ${theme.colors.text.muted};
          margin: 0 0 12px 0;
        `}
      >
        Backlinks
      </h3>

      {backlinks.length === 0 ? (
        <p
          css={css`
            font-size: 0.875rem;
            color: ${theme.colors.text.muted};
          `}
        >
          No backlinks
        </p>
      ) : (
        <ul css={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {backlinks.map((bl, i) => (
            <li key={i}>
              <button
                onClick={() => openZettelById(bl.sourceId)}
                css={css`
                  display: block;
                  width: 100%;
                  text-align: left;
                  background: ${theme.colors.bg.sunken};
                  border: 1px solid ${theme.colors.border.subtle};
                  border-radius: 6px;
                  padding: 10px 12px;
                  margin-bottom: 8px;
                  cursor: pointer;
                  &:hover { border-color: ${theme.colors.accent.default}; }
                `}
              >
                <div
                  css={css`
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: ${theme.colors.text.primary};
                    margin-bottom: 4px;
                  `}
                >
                  {bl.sourceTitle ?? '(untitled)'}
                </div>
                <div
                  css={css`
                    font-size: 0.8125rem;
                    color: ${theme.colors.text.muted};
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  `}
                >
                  {bl.context}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
