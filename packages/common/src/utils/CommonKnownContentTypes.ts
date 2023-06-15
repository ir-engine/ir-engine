/**
 * CommonKnownContentTypes object containing common content types.
 *
 * @type {Object}
 */
export const CommonKnownContentTypes = {
  xre: 'prefab/xre',
  gltf: 'model/gltf',
  glb: 'model/gltf-binary',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
  m3u8: 'application/vnd.apple.mpegurl',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
  tsx: 'application/octet-stream',
  ts: 'application/octet-stream',
  js: 'application/octet-stream',
  json: 'application/json'
}

export const MimeTypeToExtension = {
  'prefab/xre': 'xre',
  'model/gltf': 'gltf',
  'model/gltf-binary': 'glb',
  'model/usdz': 'usdz',
  'model/fbx': 'fbx',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/ktx2': 'ktx2',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/vnd.apple.mpegurl': 'm3u8',
  'video/mp4': 'mp4',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/ogg': 'ogg'
}
