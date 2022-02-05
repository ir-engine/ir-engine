/**
 * guessContentType function to get contentType from url.
 *
 * @author Robert Long
 * @param  {any} url
 * @return {string}     [contentType]
 */

import { CommonKnownContentTypes } from './CommonKnownContentTypes'

export function guessContentType(url: string): string {
  const extension = new URL(url).pathname.split('.').pop()!
  return CommonKnownContentTypes[extension]
}
