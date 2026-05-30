import { useMemo } from 'react'
import { css, useTheme } from '@emotion/react'
import { useAppStore } from '../../store/app.store'
import { debounce } from '../../utils/debounce'
import { EditorToolbar } from './EditorToolbar'
import { ZettelEditor } from './ZettelEditor'
import { MarkdownPreview } from './MarkdownPreview'
import { EmptyState } from '../common/EmptyState'

export function EditorPane() {
  const theme = useTheme()
  const openZettel = useAppStore((s) => s.openZettel)
  const editorMode = useAppStore((s) => s.editorMode)
  const updateOpenZettel = useAppStore((s) => s.updateOpenZettel)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveBody = useMemo(() => debounce((body: string) => updateOpenZettel({ body }), 300), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveTitle = useMemo(() => debounce((title: string) => updateOpenZettel({ title }), 300), [])

  if (!openZettel) {
    return (
      <main
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: ${theme.colors.bg.base};
        `}
      >
        <EmptyState message="Select or create a note" />
      </main>
    )
  }

  return (
    <main
      css={css`
        display: flex;
        flex-direction: column;
        height: 100vh;
        min-height: 0;
        background: ${theme.colors.bg.base};
      `}
    >
      <EditorToolbar
        title={openZettel.title ?? ''}
        onTitleChange={debouncedSaveTitle}
      />
      <div
        css={css`
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        `}
      >
        {editorMode === 'edit' ? (
          <ZettelEditor
            key={openZettel.id}
            initialDoc={openZettel.body}
            onChange={debouncedSaveBody}
          />
        ) : (
          <MarkdownPreview body={openZettel.body} />
        )}
      </div>
    </main>
  )
}
