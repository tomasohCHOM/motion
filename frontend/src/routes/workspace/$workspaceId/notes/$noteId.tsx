import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import type { Note } from '@/store/notes-store'
import { noteActions, notesStore } from '@/store/notes-store'
import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { ChevronLeft } from 'lucide-react'

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

    // Change: use the named notesStore import
    const noteFromStore = useStore(notesStore, (state) =>
        state.notes.find((n) => n.id === noteId),
    )

    const note = noteFromStore || initialData

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        noteActions.updateNote(noteId, { title: e.target.value })
    }

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        noteActions.updateNote(noteId, { content: e.target.value })
    }

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
                <span className="text-sm text-muted-foreground">Notes</span>
            </header>

            {/* Input */}
            <main className="flex-1 overflow-auto p-4 md:p-8 lg:p-12">
                <div className="max-w-3xl mx-auto">
                    {/* Title Input */}
                    <Input
                        value={note.title}
                        onChange={handleTitleChange}
                        placeholder="Untitled Note"
                        className="text-3xl md:text-4xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                    />

                    <Separator className="my-4 md:my-6" />

                    {/* Text Input */}
                    <Textarea
                        value={note.content}
                        onChange={handleContentChange}
                        placeholder="Start writing here..."
                        className="border-none shadow-none focus-visible:ring-0 p-0 min-h-[60vh] text-base leading-relaxed"
                    />
                </div>
            </main>
        </div>
    )
}