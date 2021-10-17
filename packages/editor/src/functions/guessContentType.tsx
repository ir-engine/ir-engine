/**
 * CommonKnownContentTypes object containing common content types.
 *
 * @author Robert Long
 * @type {Object}
 */
export const CommonKnownContentTypes = {
  gltf: 'model/gltf',
  glb: 'model/gltf-binary',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
  tsx: 'application/octet-stream',
  ts: 'application/octet-stream',
  js: 'application/octet-stream'
}

/**
 * guessContentType function to get contentType from url.
 *
 * @author Robert Long
 * @param  {any} url
 * @return {string}     [contentType]
 */

export function guessContentType(url): string {
  const extension = new URL(url).pathname.split('.').pop()!
  return CommonKnownContentTypes[extension]
}
