import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox'
import PageContent from '@/components/workspace/layout/page-content'
import type { Note } from '@/store/notes-store'
import { noteActions, notesStore } from '@/store/notes-store'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { ArrowDownUp, MoreVertical, PencilIcon, PlusIcon, SearchIcon, TagIcon, TrashIcon } from 'lucide-react'
import * as React from 'react'

interface NoteCardProps {
    note: Note
    workspaceId: string
}

function NoteCard({ note, workspaceId }: NoteCardProps) {
    const router = useRouter()
    const { allTags } = useStore(notesStore)
    const [isTagDialogOpen, setIsTagDialogOpen] = React.useState(false)
    const [currentTags, setCurrentTags] = React.useState<string[]>([])

    const handleDropdownInteraction = (e: React.MouseEvent) => e.stopPropagation()

    const navigateToEditor = () => {
        router.navigate({
            to: '/workspace/$workspaceId/notes/$noteId',
            params: { workspaceId, noteId: note.id },
        })
    }

    // Deletes the note
    const handleDelete = () => {
        noteActions.deleteNote(note.id)
    }

    // Opens the tag dialog
    const openTagDialog = () => {
        setCurrentTags(note.tags)
        setIsTagDialogOpen(true)
    }

    // Saves the updated tags
    const handleTagSave = () => {
        noteActions.updateNote(note.id, { tags: currentTags })
        setIsTagDialogOpen(false)
    }

    // Uses formatDate to display the either updated or created date
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    }
    const hasUpdated = note.updatedAt > note.createdAt;

    return (
        <AlertDialog>
            <>
                <div
                    onClick={navigateToEditor}
                    className="flex flex-col h-full rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md cursor-pointer group"
                >
                    <div className="flex flex-col flex-grow p-4">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg break-words pr-2">{note.title}</h3>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={handleDropdownInteraction}>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                        <span className="sr-only">Note options</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={handleDropdownInteraction}>
                                    <DropdownMenuItem onClick={navigateToEditor}>
                                        <PencilIcon className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={openTagDialog}>
                                        <TagIcon className="mr-2 h-4 w-4" />
                                        <span>Manage Tags</span>
                                    </DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className="text-red-500 focus:text-red-500"
                                        >
                                            <TrashIcon className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-4 min-h-[80px] break-words">
                            {note.content || 'No additional content.'}
                        </p>
                    </div>
                    <footer className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
                        {/* Displays creation date if the note has not been updated since creation */}
                        <span>
                            {hasUpdated
                                ? `Updated: ${formatDate(note.updatedAt)}`
                                : `Created: ${formatDate(note.createdAt)}`}
                        </span>
                        <div className="flex flex-wrap gap-1 justify-end">
                            {note.tags.map((tag) => (
                                <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                        </div>
                    </footer>
                </div>

                <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Manage Tags for "{note.title}"</DialogTitle>
                            <DialogDescription>
                                Select from existing tags or type to create new ones.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <MultiSelectCombobox
                                allTags={allTags}
                                selectedTags={currentTags}
                                onTagsChange={setCurrentTags}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleTagSave}>Save Tags</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialogContent onClick={handleDropdownInteraction}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the note titled "{note.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction  className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>
                        <TrashIcon className="mr-2 h-4 w-4"/> Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </>
        </AlertDialog>
    )
}

// Main Page Component
export const Route = createFileRoute('/workspace/$workspaceId/notes/')({
    component: NotesListPage,
})

function NotesListPage() {
    const router = useRouter()
    const { workspaceId } = Route.useParams()
    const { notes } = useStore(notesStore)
    const [searchTerm, setSearchTerm] = React.useState('')
    const [sortBy, setSortBy] = React.useState('updatedAt-desc')

    const handleCreateNewNote = () => {
        const newNote = noteActions.addNote()
        router.navigate({
            to: '/workspace/$workspaceId/notes/$noteId',
            params: { workspaceId, noteId: newNote.id },
            state: { initialNoteData: newNote } as any,
        })
    }

    // Use useMemo to filter and sort notes
    const displayedNotes = React.useMemo(() => {
        const filtered = notes.filter((note) =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        const [property, direction] = sortBy.split('-') as [keyof Note, 'asc' | 'desc'];

        return [...filtered].sort((a, b) => {
            const valA = a[property];
            const valB = b[property];

            let comparison = 0;
            if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            }

            return direction === 'desc' ? -comparison : comparison;
        });
    }, [notes, searchTerm, sortBy]);

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

            {/* Search and Sort Bar */}
            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search notes by title..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="shrink-0">
                            <ArrowDownUp className="mr-2 h-4 w-4" />
                            Sort By
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                            <DropdownMenuRadioItem value="updatedAt-desc">Date Updated</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="createdAt-desc">Date Created</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="title-asc">Title (A-Z)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="title-desc">Title (Z-A)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Notes List */}
            {displayedNotes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayedNotes.map((note) => (
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