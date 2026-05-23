/** Extract public_id from a Cloudinary delivery URL (fallback for legacy uploads). */
export function publicIdFromCloudinaryUrl(imageUrl: string): string | null {
  const marker = '/upload/'
  const uploadIndex = imageUrl.indexOf(marker)
  if (uploadIndex === -1) return null

  const segments = imageUrl.slice(uploadIndex + marker.length).split('/')
  let start = 0
  for (let i = 0; i < segments.length; i++) {
    if (/^v\d+$/.test(segments[i])) {
      start = i + 1
      break
    }
  }

  const pathParts = segments.slice(start)
  if (pathParts.length === 0) return null

  const last = pathParts[pathParts.length - 1]
  pathParts[pathParts.length - 1] = last.replace(/\.[^.]+$/, '')
  return pathParts.join('/')
}
