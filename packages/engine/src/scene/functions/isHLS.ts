const HLS_MIMETYPES = ['application/x-mpegurl', 'application/vnd.apple.mpegurl']
export default function isHLS(src: string, type?: any) {
  if (type && HLS_MIMETYPES.includes(type.toLowerCase())) {
    return true
  }
  if (src && src.toLowerCase().indexOf('.m3u8') > 0) {
    return true
  }
  return false
}
