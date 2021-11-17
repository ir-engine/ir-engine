import mime from 'mime-types'

export const getContentType = (url: string): string => {
  return mime.lookup(url) || 'application/octet-stream'
}
