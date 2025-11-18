export type Note = {
  id: string
  workspaceId: string
  authorId: string | null
  title: string
  content: string
  tags: Array<string>
  updatedAt: number
  createdAt: number
}
