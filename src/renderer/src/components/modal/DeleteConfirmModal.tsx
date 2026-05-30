import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { css, useTheme } from '@emotion/react'
import type { Backlink } from '../../types'

interface Props {
  backlinks: Backlink[]
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirmModal({ backlinks, onCancel, onConfirm }: Props) {
  const theme = useTheme()
  const okBtnRef = useRef<HTMLButtonElement>(null)
  const headingId = 'delete-modal-heading'

  useEffect(() => {
    okBtnRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return createPortal(
    <>
      <div
        onClick={onCancel}
        css={css`
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 100;
        `}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        css={css`
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 101;
          background: ${theme.colors.bg.base};
          border-radius: 10px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 28px 32px;
          width: 440px;
          max-width: calc(100vw - 48px);
          max-height: 70vh;
          display: flex;
          flex-direction: column;
        `}
      >
        <h2
          id={headingId}
          css={css`
            margin: 0 0 8px 0;
            font-size: 1rem;
            font-weight: 600;
            color: ${theme.colors.danger.default};
          `}
        >
          Cannot delete — {backlinks.length} backlink{backlinks.length !== 1 ? 's' : ''} reference this note
        </h2>
        <p
          css={css`
            margin: 0 0 16px 0;
            font-size: 0.875rem;
            color: ${theme.colors.text.muted};
          `}
        >
          Remove the links from these notes first, then delete.
        </p>

        <ul
          css={css`
            list-style: none;
            margin: 0 0 24px 0;
            padding: 0;
            overflow-y: auto;
            flex: 1;
            min-height: 0;
          `}
        >
          {backlinks.map((bl, i) => (
            <li
              key={i}
              css={css`
                padding: 8px 0;
                border-bottom: 1px solid ${theme.colors.border.subtle};
                font-size: 0.875rem;
                color: ${theme.colors.text.primary};
              `}
            >
              <strong>{bl.sourceTitle ?? '(untitled)'}</strong>
              <span
                css={css`
                  display: block;
                  color: ${theme.colors.text.muted};
                  margin-top: 2px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                `}
              >
                {bl.context}
              </span>
            </li>
          ))}
        </ul>

        <div css={css`display: flex; justify-content: flex-end;`}>
          <button
            ref={okBtnRef}
            onClick={onConfirm}
            css={css`
              padding: 8px 20px;
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
            OK
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}
