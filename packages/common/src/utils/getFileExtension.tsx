/**
 * getFileExtension function to get file extension from url.
 *
 * @author Ron Oyama
 * @param  {any} url
 * @return {string}     [extension]
 */

export function getFileExtension(url): string {
  try {
    const extension = new URL(url).pathname.split('.').pop()!
    return extension
  } catch (error) {
    return ''
  }
}
