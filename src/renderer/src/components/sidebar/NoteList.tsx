import { useAppStore } from '../../store/app.store'
import { NoteListItem } from './NoteListItem'
import { EmptyState } from '../common/EmptyState'

export function NoteList() {
  const zettelList = useAppStore((s) => s.zettelList)
  const openZettel = useAppStore((s) => s.openZettel)
  const openZettelById = useAppStore((s) => s.openZettelById)

  if (zettelList.length === 0) {
    return <EmptyState message="No notes yet" />
  }

  return (
    <ul css={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {zettelList.map((z) => (
        <NoteListItem
          key={z.id}
          zettel={z}
          isActive={openZettel?.id === z.id}
          onClick={() => openZettelById(z.id)}
        />
      ))}
    </ul>
  )
}
