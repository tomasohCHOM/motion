import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { PlusIcon, SearchIcon } from 'lucide-react'
import * as React from 'react'
import type { Note } from '@/store/notes-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PageContent from '@/components/workspace/layout/page-content'
import notesStore, { noteActions } from '@/store/notes-store'

interface NoteCardProps {
  note: Note
  workspaceId: string
}

function NoteCard({ note, workspaceId }: NoteCardProps) {
  const contentPreview = note.content || 'No additional content.'

  return (
    <Link
      to="/workspace/$workspaceId/notes/$noteId"
      params={{ workspaceId, noteId: note.id }}
      className="flex flex-col h-full rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="flex-grow p-4 space-y-2">
        <h3 className="font-semibold text-lg break-words">{note.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-4 min-h-[80px] break-words">
          {contentPreview}
        </p>
      </div>
      <footer className="border-t p-4 text-xs text-muted-foreground">
        Updated: {note.updatedAt}
      </footer>
    </Link>
  )
}

// All Notes Page
export const Route = createFileRoute('/workspace/$workspaceId/notes/')({
  component: NotesListPage,
})

function NotesListPage() {
  const router = useRouter()
  const { workspaceId } = Route.useParams()
  const { notes } = useStore(notesStore)
  const [searchTerm, setSearchTerm] = React.useState('')

  const handleCreateNewNote = () => {
    const newNote = noteActions.addNote()
    router.navigate({
      to: '/workspace/$workspaceId/notes/$noteId',
      params: { workspaceId, noteId: newNote.id },
      state: { initialNoteData: newNote } as any,
    })
  }

  // Filter notes based on search term
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <PageContent>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <div>
          <h1 className="font-bold text-2xl md:text-4xl">All Notes</h1>
          <p className="text-muted-foreground">
            Browse and manage your documents.
          </p>
        </div>
        <Button onClick={handleCreateNewNote}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes by title..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} workspaceId={workspaceId} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground mt-16 border border-dashed rounded-lg p-12">
          <h3 className="text-xl font-semibold">No notes found</h3>
          <p className="mt-2">Click "New Note" to create your first note.</p>
        </div>
      )}
    </PageContent>
  )
}
