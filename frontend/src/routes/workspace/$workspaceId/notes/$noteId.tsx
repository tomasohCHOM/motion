import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useDebounce } from '@/hooks/use-debounce'
import { noteActions, notesStore } from '@/store/notes-store'
import type { Note } from '@/store/notes-store'
import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { ChevronLeft } from 'lucide-react'
import * as React from 'react'

export const Route = createFileRoute('/workspace/$workspaceId/notes/$noteId')({
    parseParams: (params: { noteId: string }) => ({
        noteId: params.noteId,
    }),
    component: NoteEditorPage,
})

function NoteEditorPage() {
    const { noteId, workspaceId } = Route.useParams()
    const location = useLocation()

    const initialData = (location.state as { initialNoteData?: Note } | null)
        ?.initialNoteData

    const noteFromStore = useStore(notesStore, (state) =>
        state.notes.find((n) => n.id === noteId),
    )

    const note = noteFromStore || initialData

    // Local state for immediate input responsiveness
    const [title, setTitle] = React.useState(note?.title || '')
    const [content, setContent] = React.useState(note?.content || '')
    const [saveStatus, setSaveStatus] = React.useState('Saved')

    // Debounced values that will trigger the save action
    const debouncedTitle = useDebounce(title, 500)
    const debouncedContent = useDebounce(content, 500)

    // Effect to sync store data to local state if the underlying note changes
    React.useEffect(() => {
        if (note) {
            setTitle(note.title)
            setContent(note.content)
        }
    }, [note])

    // Effect to save debounced data to the global store
    React.useEffect(() => {
        if (note && (debouncedTitle !== note.title || debouncedContent !== note.content)) {
            noteActions.updateNote(noteId, { title: debouncedTitle, content: debouncedContent })
            setSaveStatus('Saved')
        }
    }, [debouncedTitle, debouncedContent, noteId, note])

    // Effect to show "Saving..." status immediately on typing
    React.useEffect(() => {
        if (note && (title !== note.title || content !== note.content)) {
            setSaveStatus('Saving...')
        }
    }, [title, content, note])


    if (!note) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-2xl font-semibold mb-4">Note not found</h2>
                <Button asChild variant="outline">
                    <Link
                        to="/workspace/$workspaceId/notes"
                        params={{ workspaceId }}
                    >
                        Return to Notes List
                    </Link></Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Editor Header */}
            <header className="flex items-center gap-2 p-2 border-b shrink-0">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link
                        to="/workspace/$workspaceId/notes"
                        params={{ workspaceId }}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link></Button>
                <span className="text-sm text-muted-foreground">Notes / {note.title}</span>
                <span className="ml-auto pr-2 text-sm text-muted-foreground transition-opacity">
                    {saveStatus}
                </span>
            </header>

            {/* Text Input */}
            <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-12">
                <div className="max-w-3xl mx-auto">
                    {/* Title */}
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled Note"
                        className="text-3xl md:text-4xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                    />

                    <Separator className="my-4 md:my-6" />
                    {/* Content */}
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing here..."
                        className="border-none shadow-none focus-visible:ring-0 p-0 min-h-[60vh] text-base leading-relaxed"
                    />
                </div>
            </main>
        </div>
    )
}
