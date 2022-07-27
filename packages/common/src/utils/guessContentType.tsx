/**
 * guessContentType function to get contentType from url.
 *
 * @param  {any} url
 * @return {string}     [contentType]
 */
import { CommonKnownContentTypes } from './CommonKnownContentTypes'

export function guessContentType(url: string): string {
  const contentPath = new URL(url).pathname
  //check for xre gltf extension
  if (/\.xre\.gltf$/.test(contentPath)) {
    return CommonKnownContentTypes.xre
  }
  const extension = contentPath.split('.').pop()!
  return CommonKnownContentTypes[extension]
}
