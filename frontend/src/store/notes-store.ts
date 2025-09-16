import { Store } from '@tanstack/store'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  updatedAt: number
  createdAt: number
}

// Define the state structure
interface NotesState {
  notes: Note[]
  allTags: string[]
}


// Create the store instance
export const notesStore = new Store<NotesState>({
  notes: [],
  allTags: [],
})

// Helper function to get updated tags
const getUpdatedTags = (notes: Note[]): string[] => {
  const allTagsSet = new Set<string>()
  notes.forEach((note) => {
    note.tags.forEach((tag) => allTagsSet.add(tag))
  })
  return Array.from(allTagsSet).sort()
}

// Define actions to manipulate the store
export const noteActions = {
  addNote: (noteToAdd?: Note) => {
    const now = Date.now()
    const newNote = noteToAdd || {
      id: crypto.randomUUID(),
      title: 'Untitled',
      content: '',
      tags: [],
      createdAt: now,
      updatedAt: now,
    }
    notesStore.setState((state) => {
      const newNotes = [newNote, ...state.notes]
      return {
        notes: newNotes,
        allTags: getUpdatedTags(newNotes),
      }
    })
    return newNote
  },

  // Update a note by its ID
  updateNote: (noteId: string, updates: Partial<Note>) => {
    notesStore.setState((state) => {
      const newNotes = state.notes.map((note) =>
        note.id === noteId
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note,
      )
      return {
        notes: newNotes,
        allTags: getUpdatedTags(newNotes),
      }
    })
  },

  // Delete a note by its ID
  deleteNote: (noteId: string) => {
    notesStore.setState((state) => {
      const newNotes = state.notes.filter((note) => note.id !== noteId)
      return {
        notes: newNotes,
        allTags: getUpdatedTags(newNotes),
      }
    })
  },
}