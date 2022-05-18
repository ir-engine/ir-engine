/**
 * Get hash string from the asset file name.
 * @param str Name of the asset file.
 * @returns The hash plus part of the file name.
 */

export const hashFromResourceName = (str: string): string => {
  let hash = 0
  let i = 0
  const len = str.length
  while (i < len) {
    hash = ((hash << 5) - hash + str.charCodeAt(i++)) << 0
  }
  return `${hash}${str.substr(Math.max(str.length - 7, 0))}`
}
