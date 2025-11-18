import { Store } from '@tanstack/store'
import type { Note } from '@/types/note'

// Define the state structure
interface NotesState {
  notes: Array<Note>
  allTags: Array<string>
}

const initialState: NotesState = {
  notes: [],
  allTags: [],
}

// Create the store instance
export const notesStore = new Store<NotesState>(initialState)

const buildState = (notes: Array<Note>): NotesState => ({
  notes,
  allTags: getUpdatedTags(notes),
})

// Helper function to get updated tags
const getUpdatedTags = (notes: Array<Note>): Array<string> => {
  const allTagsSet = new Set<string>()
  notes.forEach((note) => {
    note.tags.forEach((tag) => allTagsSet.add(tag))
  })
  return Array.from(allTagsSet).sort()
}

// Define actions to manipulate the store
export const noteActions = {
  reset: () => {
    notesStore.setState(initialState)
  },

  setNotes: (notes: Array<Note>) => {
    notesStore.setState(() => buildState(notes))
  },

  upsertNote: (note: Note) => {
    notesStore.setState((state) => {
      const existingIndex = state.notes.findIndex((n) => n.id === note.id)
      let newNotes: Array<Note>

      if (existingIndex === -1) {
        newNotes = [note, ...state.notes]
      } else {
        newNotes = state.notes.map((n, index) =>
          index === existingIndex ? { ...n, ...note } : n,
        )
      }

      return buildState(newNotes)
    })
  },

  addNote: (noteToAdd: Note) => {
    notesStore.setState((state) => {
      const newNotes = [
        noteToAdd,
        ...state.notes.filter((n) => n.id !== noteToAdd.id),
      ]
      return buildState(newNotes)
    })
    return noteToAdd
  },

  // Update a note by its ID
  updateNote: (
    noteId: string,
    updates: Partial<Note>,
    options: { touchUpdatedAt?: boolean } = { touchUpdatedAt: true },
  ) => {
    notesStore.setState((state) => {
      const newNotes = state.notes.map((note) => {
        if (note.id !== noteId) return note

        return {
          ...note,
          ...updates,
          updatedAt:
            options.touchUpdatedAt === false ? note.updatedAt : Date.now(),
        }
      })
      return buildState(newNotes)
    })
  },

  // Delete a note by its ID
  deleteNote: (noteId: string) => {
    notesStore.setState((state) => {
      const newNotes = state.notes.filter((note) => note.id !== noteId)
      return buildState(newNotes)
    })
  },
}
