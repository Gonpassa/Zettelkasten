import { useEffect, useRef } from 'react'
import { css } from '@emotion/react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { markdown } from '@codemirror/lang-markdown'

interface Props {
  initialDoc: string
  onChange: (next: string) => void
}

export function ZettelEditor({ initialDoc, onChange }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  // Mount once — key={openZettel.id} in parent forces remount on note change
  useEffect(() => {
    if (!hostRef.current) return

    const state = EditorState.create({
      doc: initialDoc,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        syntaxHighlighting(defaultHighlightStyle),
        markdown(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange(u.state.doc.toString())
        }),
        EditorView.lineWrapping,
      ],
    })

    const view = new EditorView({ state, parent: hostRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={hostRef}
      css={css`
        height: 100%;
        .cm-editor {
          height: 100%;
          font-size: 0.9375rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
        .cm-scroller {
          overflow: auto;
          padding: 16px;
        }
      `}
    />
  )
}
