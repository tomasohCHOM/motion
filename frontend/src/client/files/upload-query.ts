import { useMutation } from '@tanstack/react-query'
import type { FileItem } from '@/store/files/files-store'

type PresignedResponse = {
  upload_url: string
  key: string
}

async function uploadFile(file: FileItem, userId: string) {
  const presignedRes = await fetch(
    `${import.meta.env.VITE_FILES_SERVICE_URL}/upload/presigned`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_type: file.fileType,
        filename: file.name,
        file_size: file.size,
        user_id: userId,
      }),
    },
  )

  if (!presignedRes.ok) throw new Error('Failed to get presigned URL')
  const { upload_url, key }: PresignedResponse = await presignedRes.json()

  const uploadRes = await fetch(upload_url, {
    method: 'PUT',
    body: file.file,
    headers: { 'Content-Type': file.fileType },
  })

  if (!uploadRes.ok) throw new Error('File upload failed')

  const completeRes = await fetch(
    `${import.meta.env.VITE_FILES_SERVICE_URL}/upload/complete`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        user_id: userId,
      }),
    },
  )

  if (!completeRes.ok) throw new Error('Failed to notify completion')

  return { key }
}

export function useFileUpload() {
  return useMutation({
    mutationFn: async ({ file, userId }: { file: FileItem; userId: string }) =>
      uploadFile(file, userId),
  })
}
