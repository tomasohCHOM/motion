import type { Note } from '@/types/note'

export type NoteApiResponse = {
  id: string
  workspace_id: string
  author_id: string | null
  title: string
  content: string
  tags: Array<string> | null
  created_at: string
  updated_at: string
}

const parseTimestamp = (value: string | number | Date | undefined | null) => {
  if (!value) return Date.now()
  if (typeof value === 'number') return value
  if (value instanceof Date) return value.getTime()
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

export const mapNoteResponse = (note: NoteApiResponse): Note => ({
  id: note.id,
  workspaceId: note.workspace_id,
  authorId: note.author_id,
  title: note.title,
  content: note.content,
  tags: note.tags ?? [],
  createdAt: parseTimestamp(note.created_at),
  updatedAt: parseTimestamp(note.updated_at),
})
