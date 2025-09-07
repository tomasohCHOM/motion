import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PageContent from '@/components/workspace/layout/page-content'
import type { Note } from '@/store/notes-store'
import notesStore, { noteActions } from '@/store/notes-store'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { FileTextIcon, PlusIcon, SearchIcon } from 'lucide-react'
import * as React from 'react'

interface NoteRowProps {
  note: Note
  workspaceId: string 
}

function NoteRow({ note, workspaceId }: NoteRowProps) {
  return (
    <Link
      to="/workspace/$workspaceId/notes/$noteId"
      params={{ workspaceId, noteId: note.id }}
      className="flex items-center p-2 hover:bg-accent rounded-lg group transition-colors"
    >
      <FileTextIcon className="h-4 w-4 mr-3 shrink-0 text-muted-foreground" />
      <div className="flex-1 truncate">
        <span className="font-medium">{note.title}</span>
      </div>
      <div className="flex items-center gap-2 mx-4 hidden md:flex">
        {note.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="w-32 text-sm text-muted-foreground hidden sm:block">
        {note.updatedAt}
      </div>
    </Link>
  )
}

//  All Notes Page
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
      {/*  Header  */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <div>
          <h1 className="font-bold text-2xl md:text-4xl">All Notes</h1>
          <p className="text-muted-foreground">Manage and organize your documents.</p>
        </div>
        <Button onClick={handleCreateNewNote}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {/*  Search Bar  */}
      <div className="relative bottom-8 ">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes by title..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/*  Notes List  */}
      <div className="flex flex-col gap-1">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <NoteRow key={note.id} note={note} workspaceId={workspaceId} />
          ))
        ) : (
          <div className="text-center text-muted-foreground mt-16 border border-dashed rounded-lg p-12">
            <h3 className="text-xl font-semibold">No notes found</h3>
            <p className="mt-2">Click "New Note" to create your first note.</p>
          </div>
        )}
      </div>
    </PageContent>
  )
}