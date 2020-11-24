const HLS_MIMETYPES = [
  "application/x-mpegurl",
  "application/vnd.apple.mpegurl"
];
export default function isHLS(src, type) {
  if (type && HLS_MIMETYPES.includes(type.toLowerCase())) {
    return true;
  }
  if (src && src.toLowerCase().indexOf(".m3u8") > 0) {
    return true;
  }
  return false;
}
