export function timeAgo(dateString: string): string {
  const date = new Date(
    dateString.endsWith('Z') ? dateString : dateString + 'Z',
  )
  const now = new Date()

  const diff = (now.getTime() - date.getTime()) / 1000 // difference in seconds

  if (diff < 60) return 'just now'
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60)
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  }
  if (diff < 2592000) {
    const days = Math.floor(diff / 86400)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }
  if (diff < 31536000) {
    const months = Math.floor(diff / 2592000)
    return `${months} month${months !== 1 ? 's' : ''} ago`
  }

  const years = Math.floor(diff / 31536000)
  return `${years} year${years !== 1 ? 's' : ''} ago`
}
