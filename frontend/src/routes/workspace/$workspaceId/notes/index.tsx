import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import PageContent from '@/components/workspace/layout/page-content'
import type { Note } from '@/store/notes-store'
import notesStore, { noteActions } from '@/store/notes-store'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { MoreVertical, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'

interface NoteCardProps {
    note: Note
    workspaceId: string
}

function NoteCard({ note, workspaceId }: NoteCardProps) {
    const router = useRouter()

    const navigateToEditor = () => {
        router.navigate({
            to: '/workspace/$workspaceId/notes/$noteId',
            params: { workspaceId, noteId: note.id },
        })
    }

    // Deletion confirmation
    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this note permanently?')) {
            noteActions.deleteNote(note.id)
        }
    }

    // Prevents card click navigation when interacting with dropdown menu
    const handleDropdownInteraction = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    const hasUpdated = note.updatedAt !== note.createdAt;

    return (
        <div
            onClick={navigateToEditor}
            className="flex flex-col h-full rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md cursor-pointer group"
        >
            {/* Clickable content area */}
            <div className="flex-grow space-y-2 p-4">
                <h3 className="font-semibold text-lg break-words">{note.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-4 min-h-[80px] break-words">
                    {note.content || 'No additional content.'}
                </p>
            </div>

            {/* Footer with actions */}
            <footer className="flex items-center justify-between border-t px-2 py-1 text-xs text-muted-foreground">
                <span className="pl-2">{hasUpdated ? 'Created at: ' + note.createdAt : 'Updated at: ' + note.updatedAt}</span>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={handleDropdownInteraction}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <span className="sr-only">Note options</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={handleDropdownInteraction}>
                        <DropdownMenuItem onClick={navigateToEditor}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                            <TrashIcon className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </footer>
        </div>
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

    const filteredNotes = notes.filter((note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <PageContent>
            {/* Header */}
            <div className="flex justify-between items-center mb-4 gap-4">
                <div>
                    <h1 className="font-bold text-2xl md:text-4xl">All Notes</h1>
                    <p className="text-muted-foreground">Browse and manage your documents.</p>
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
                    {notes.map((note) => (
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
