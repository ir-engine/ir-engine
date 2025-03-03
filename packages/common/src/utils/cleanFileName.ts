/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { END_WITH_ALPHANUMERIC_REGEX, SANITIZE_FILENAME_REGEX, START_WITH_ALPHANUMERIC_REGEX } from '../regex'

/**
 * Encodes a filename by replacing special characters with a safe format:
 * 1. Converts parentheses to underscores/hyphens: '(' -> '_', ')' -> '-'
 * 2. Preserves existing hyphens by doubling them: '-' -> '--'
 * 3. Converts spaces to single hyphens
 * 4. Adds 'x' prefix if filename starts with special chars
 * 5. Adds 'y' suffix if filename ends with special chars
 *
 * @param displayName - The original filename to encode
 * @returns The encoded filename safe for storage/transmission
 *
 * @example
 * // Returns "hello--world"
 * getEncodedFileName("hello-world")
 *
 * // Returns "x_test-y"
 * getEncodedFileName("(test)")
 *
 * // Returns "my-file-name"
 * getEncodedFileName("my file name")
 */
export const getEncodedFileName = (displayName: string) => {
  let encoded = displayName
    .replace(/\(/g, '_') // opening parenthesis to underscore
    .replace(/\)/g, '-') // closing parenthesis to hyphen
    .replace(/-/g, '--') // preserve hyphens by doubling them
    .replace(/\s/g, '-') // spaces to single hyphens

  // Add 'x' at the beginning if it starts with special characters
  if (/^[-_]/.test(encoded)) {
    encoded = 'x' + encoded
  }
  // Add 'y' at the end if it ends with special characters
  if (/[-_]$/.test(encoded)) {
    encoded = encoded + 'y'
  }
  return encoded
}

/**
 * Decodes a filename that was previously encoded by getEncodedFileName by:
 * 1. Removing 'x' prefix and 'y' suffix if they were added during encoding
 * 2. Converting underscores back to opening parentheses '(' in specific positions
 * 3. Converting hyphens back to closing parentheses ')' when appropriate
 * 4. Restoring original hyphens that were doubled during encoding
 * 5. Converting remaining single hyphens back to spaces
 *
 * @param encodedName - The encoded filename to decode
 * @returns The original filename with special characters restored
 *
 * @example
 * // Returns "hello-world"
 * getDecodedFileName("hello--world")
 *
 * // Returns "(test)"
 * getDecodedFileName("x_test-y")
 *
 * // Returns "my file name"
 * getDecodedFileName("my-file-name")
 */
export const getDecodedFileName = (encodedName: string) => {
  let decoded = encodedName
  // Remove added characters if they were added during encoding
  if (decoded.startsWith('x') && /^x[-_]/.test(decoded)) {
    decoded = decoded.slice(1)
  }
  if (decoded.endsWith('y') && /[-_]y$/.test(decoded)) {
    decoded = decoded.slice(0, -1)
  }

  return decoded
    .replace(/(?<=^|\s)_/g, '(') // underscore to opening parenthesis (if preceded by start or space)
    .replace(/(?<![\d\s])_(?=\d)/g, '(') // underscore to opening parenthesis before numbers
    .replace(/-(?=\s|$)/g, ')') // hyphen to closing parenthesis if followed by space or end
    .replace(/--/g, '§') // temporarily replace double hyphens
    .replace(/-(?!\d)/g, ' ') // single hyphens to spaces (except if followed by number)
    .replace(/(?<![\d\s])-/g, ' ') // remaining single hyphens to spaces
    .replace(/§/g, '-') // restore original hyphens
}

/**
 * This method takes a filename (with or without included path) and returns a cleaned version of it.
 * Ensures toLower file extension, truncates a file name if too long, and sanitizes special characters
 * @param fullFileName
 * @param useStorageProviderLengthRestrictions
 */
export const cleanFileNameString = (fullFileName: string, useStorageProviderLengthRestrictions = false): string => {
  try {
    //extract the path and file name separately
    const lastSlashIndex = fullFileName.lastIndexOf('/')
    const filePath = fullFileName.substring(0, lastSlashIndex)
    const fileName = fullFileName.substring(lastSlashIndex + 1)

    // Find the last period in the filename (the start of the extension)
    const _lastDotIndex = fileName.lastIndexOf('.')
    const hasExtension = _lastDotIndex !== -1
    const lastDotIndex = hasExtension ? _lastDotIndex : fileName.length

    // Split the name into the part before and after the dot
    let nameWithoutExtension = fileName.substring(0, lastDotIndex)
    const extension = fileName.substring(lastDotIndex + 1).toLowerCase()

    //Used by backend uploads to storage provider...
    if (useStorageProviderLengthRestrictions) {
      if (nameWithoutExtension.length > 1024) nameWithoutExtension = nameWithoutExtension.slice(0, 1024)
    } else {
      // Sanitize the name part and skiped if needed in the server
      nameWithoutExtension = nameWithoutExtension
        .replace(SANITIZE_FILENAME_REGEX, '-')
        .replace(START_WITH_ALPHANUMERIC_REGEX, '')
        .replace(END_WITH_ALPHANUMERIC_REGEX, '')
      // Truncate or concat the name if it is too long or too short
      if (nameWithoutExtension.length > 64) {
        nameWithoutExtension = nameWithoutExtension.slice(0, 64)
      } else if (nameWithoutExtension.length < 4) {
        nameWithoutExtension = nameWithoutExtension.padEnd(4, '0')
      }
    }

    // Combine the name with the lowercase extension
    const newFileName = hasExtension ? `${nameWithoutExtension}.${extension}` : `${nameWithoutExtension}`
    return filePath ? filePath + '/' + newFileName : newFileName
  } catch (e) {
    return fullFileName
  }
}

/**
 * Returns a new File object with the same properties as the input file,
 * but with the extension in lowercase and filename truncated if it is too long.
 * @param file
 */
export function cleanFileNameFile(file: File): File {
  const newFile = new File([file], cleanFileNameString(file.name), {
    type: file.type,
    lastModified: file.lastModified
  })
  //overwrite the webkitRelativePath property to preserve directory structure
  Object.defineProperty(newFile, 'webkitRelativePath', {
    value: file.webkitRelativePath !== '' ? cleanFileNameString(file.webkitRelativePath) : '',
    writable: false,
    enumerable: true,
    configurable: true
  })
  return newFile
}
