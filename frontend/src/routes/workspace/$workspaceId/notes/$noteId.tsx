import { Link, createFileRoute, useLocation } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import * as React from 'react'
import { Route as WorkspaceRoute } from '../route'
import type { Note } from '@/types/note'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { fetchWorkspaceNote } from '@/client/notes/get-note-query'
import { useUpdateNoteMutation } from '@/client/notes/update-note-mutation'
import { useDebounce } from '@/hooks/use-debounce'
import { noteActions, notesStore } from '@/store/notes-store'

export const Route = createFileRoute('/workspace/$workspaceId/notes/$noteId')({
  parseParams: (params: { noteId: string }) => ({
    noteId: params.noteId,
  }),
  component: NoteEditorPage,
})

function NoteEditorPage() {
  const { noteId, workspaceId } = Route.useParams()
  const location = useLocation()
  const locationState = location.state as
    | {
        isNew?: boolean
        initialNoteData?: Note
      }
    | null
    | undefined
  const { auth } = WorkspaceRoute.useRouteContext()
  const queryClient = useQueryClient()
  const noteQueryKey = React.useMemo(
    () => ['workspace', workspaceId, 'note', noteId] as const,
    [workspaceId, noteId],
  )
  const notesQueryKey = React.useMemo(
    () => ['workspace', workspaceId, 'notes'] as const,
    [workspaceId],
  )

  // Add a flag from navigation state to identify a new note.
  const isNewNote = Boolean(locationState?.isNew)
  const initialData = locationState?.initialNoteData

  // Add the new note to the store on the first render of the editor page.
  React.useEffect(() => {
    if (isNewNote && initialData) {
      const newNoteData = initialData
      // Check if the note isn't already in the store to prevent duplicates
      const noteExists = notesStore.state.notes.some(
        (n) => n.id === newNoteData.id,
      )
      if (!noteExists) {
        noteActions.addNote(newNoteData)
      }
    }
  }, [isNewNote, initialData])

  const noteFromStore = useStore(notesStore, (state) =>
    state.notes.find((n) => n.id === noteId),
  )

  const updateNoteMutation = useUpdateNoteMutation()

  const noteQuery = useQuery({
    queryKey: noteQueryKey,
    queryFn: async () => {
      const token = await auth.getToken({
        skipCache: false,
        template: 'backend',
      })
      return fetchWorkspaceNote(workspaceId, noteId, token ?? null)
    },
    initialData: noteFromStore ?? initialData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })

  React.useEffect(() => {
    const fetchedNote = noteQuery.data
    if (!fetchedNote) return
    noteActions.upsertNote(fetchedNote)
    queryClient.setQueryData<Array<Note>>(notesQueryKey, (current = []) => {
      const exists = current.some((existing) => existing.id === fetchedNote.id)
      if (!exists) {
        return [fetchedNote, ...current]
      }
      return current.map((existing) =>
        existing.id === fetchedNote.id ? fetchedNote : existing,
      )
    })
  }, [noteQuery.data, notesQueryKey, queryClient])

  const note = noteFromStore || noteQuery.data || initialData

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

  // Effect to save debounced data to the store and backend
  React.useEffect(() => {
    if (!note) return
    const hasChanges =
      debouncedTitle !== note.title || debouncedContent !== note.content
    if (!hasChanges) return

    let cancelled = false

    const syncNote = async () => {
      noteActions.updateNote(noteId, {
        title: debouncedTitle,
        content: debouncedContent,
      })

      try {
        const updated = await updateNoteMutation.mutateAsync({
          workspaceId,
          noteId,
          title: debouncedTitle,
          content: debouncedContent,
        })
        if (cancelled) return
        noteActions.upsertNote(updated)
        queryClient.setQueryData<Array<Note>>(
          notesQueryKey,
          (current = []) =>
            current.map((existing) =>
              existing.id === updated.id ? updated : existing,
            ),
        )
        queryClient.setQueryData<Note>(noteQueryKey, updated)
        setSaveStatus('Saved')
      } catch (err) {
        if (!cancelled) {
          setSaveStatus('Failed to save')
          console.error('Failed to save note', err)
        }
      }
    }

    syncNote()

    return () => {
      cancelled = true
    }
  }, [
    debouncedTitle,
    debouncedContent,
    note?.title,
    note?.content,
    noteId,
    workspaceId,
    updateNoteMutation,
    queryClient,
    notesQueryKey,
    noteQueryKey,
  ])

  // Effect to show "Saving..." status immediately on typing
  React.useEffect(() => {
    if (note && (title !== note.title || content !== note.content)) {
      setSaveStatus('Saving...')
    }
  }, [title, content, note])

  if (!note) {
    if (noteQuery.isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Spinner className="h-8 w-8 text-muted-foreground" />
        </div>
      )
    }

    const notFound =
      noteQuery.isError &&
      noteQuery.error instanceof Error &&
      noteQuery.error.message.includes('404')

    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-semibold mb-4">
          {notFound ? 'Note not found' : 'Unable to load note'}
        </h2>
        <Button asChild variant="outline">
          <Link to="/workspace/$workspaceId/notes" params={{ workspaceId }}>
            Return to Notes List
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Editor Header */}
      <header className="flex items-center gap-2 p-2 border-b shrink-0">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link to="/workspace/$workspaceId/notes" params={{ workspaceId }}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Notes / {note.title}
        </span>
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
