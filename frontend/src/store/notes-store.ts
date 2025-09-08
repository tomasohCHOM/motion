import { Store } from '@tanstack/store'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  updatedAt: string
}

// Define the state structure 
interface NotesState {
  notes: Note[]
}

// Create the store instance
const notesStore = new Store<NotesState>({
  notes: [],
})

// Define actions to manipulate the store
export const noteActions = {
  addNote: (partialNote: Partial<Note> = {}) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: partialNote.title || 'Untitled',
      content: partialNote.content || '',
      tags: partialNote.tags || [],
      updatedAt: new Date().toLocaleDateString(),
    }
    notesStore.setState((state) => ({
      notes: [newNote, ...state.notes],
    }))
    return newNote 
  },

  updateNote: (noteId: string, updates: Partial<Note>) => {
    notesStore.setState((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId
          ? { ...note, ...updates, updatedAt: new Date().toLocaleDateString() }
          : note,
      ),
    }))
  },

  // Delete a note by its ID
  deleteNote: (noteId: string) => {
    notesStore.setState((state) => ({
      notes: state.notes.filter((note) => note.id !== noteId),
    }))
  },
}

export default notesStore