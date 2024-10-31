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

/**
 * This method takes a filename (with or without included path) and returns a cleaned version of it.
 * ensures toLower file extension, truncates a file name if too long
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

    //Used by backend uploads to storage provider, which has different length restrictions than other uses
    if (useStorageProviderLengthRestrictions) {
      if (nameWithoutExtension.length > 1024) nameWithoutExtension = nameWithoutExtension.slice(0, 1024)
    } else {
      // Truncate or concat the name if it is too long or too short
      if (nameWithoutExtension.length > 64) {
        nameWithoutExtension = nameWithoutExtension.slice(0, 64)
      } else if (nameWithoutExtension.length < 4) {
        //file names need to be longer than 3 characters to be valid for s3 - https://docs.weka.io/additional-protocols/s3/s3-limitations
        nameWithoutExtension = nameWithoutExtension + '0000'
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
