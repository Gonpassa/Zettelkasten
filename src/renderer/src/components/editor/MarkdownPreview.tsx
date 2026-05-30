import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { css, useTheme } from '@emotion/react'

interface Props {
  body: string
}

export function MarkdownPreview({ body }: Props) {
  const theme = useTheme()
  return (
    <div
      css={css`
        padding: 24px 32px;
        max-width: 720px;
        color: ${theme.colors.text.primary};
        line-height: 1.7;
        font-size: 1rem;

        h1, h2, h3, h4, h5, h6 {
          color: ${theme.colors.text.primary};
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        p { margin: 0.75em 0; }
        code {
          background: ${theme.colors.bg.sunken};
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 0.875em;
        }
        pre code { background: transparent; padding: 0; }
        pre {
          background: ${theme.colors.bg.sunken};
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
        }
        blockquote {
          border-left: 3px solid ${theme.colors.border.subtle};
          margin: 0;
          padding-left: 1em;
          color: ${theme.colors.text.muted};
        }
        a { color: ${theme.colors.accent.default}; }
        table { border-collapse: collapse; width: 100%; }
        th, td {
          border: 1px solid ${theme.colors.border.subtle};
          padding: 6px 12px;
          text-align: left;
        }
        th { background: ${theme.colors.bg.sunken}; }
      `}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  )
}
