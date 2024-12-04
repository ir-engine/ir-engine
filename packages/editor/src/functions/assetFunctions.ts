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

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import {
  CancelableUploadPromiseArrayReturnType,
  CancelableUploadPromiseReturnType,
  uploadToFeathersService
} from '@ir-engine/client-core/src/util/upload'
import { API } from '@ir-engine/common'
import { assetLibraryPath, fileBrowserPath, fileBrowserUploadPath } from '@ir-engine/common/src/schema.type.module'
import { CommonKnownContentTypes } from '@ir-engine/common/src/utils/CommonKnownContentTypes'
import { cleanFileNameFile, cleanFileNameString } from '@ir-engine/common/src/utils/cleanFileName'
import { KTX2EncodeArguments } from '@ir-engine/engine/src/assets/constants/CompressionParms'
import { pathJoin } from '@ir-engine/engine/src/assets/functions/miscUtils'
import { modelResourcesPath } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { getMutableState } from '@ir-engine/hyperflux'
import { KTX2Encoder } from '@ir-engine/xrui/core/textures/KTX2Encoder'
import { ImportSettingsState } from '../services/ImportSettingsState'

enum FileType {
  THREE_D = '3D',
  IMAGE = 'Image',
  AUDIO = 'Audio',
  VIDEO = 'Video',
  UNKNOWN = 'Unknown'
}

const unsupportedFileMessage = {
  [FileType.THREE_D]: 'Please upload either a .gltf or a .glb.',
  [FileType.IMAGE]: 'Please upload a .png, .tiff, .jpg, .jpeg, .gif, or .ktx2.',
  [FileType.AUDIO]: 'Please upload a .mp3, .mpeg, .m4a, or .wav.',
  [FileType.VIDEO]: 'Please upload a .mp4, .mkv, or .avi.',
  [FileType.UNKNOWN]: 'Please upload a valid 3D, Image, Audio, or Video file.'
}

const supportedFiles = {
  [FileType.THREE_D]: new Set(['.gltf', '.glb', '.bin']),
  [FileType.IMAGE]: new Set(['.png', '.tiff', '.jpg', '.jpeg', '.gif', '.ktx2']),
  [FileType.AUDIO]: new Set(['.mp3', '.mpeg', '.m4a', '.wav']),
  [FileType.VIDEO]: new Set(['.mp4', '.mkv', '.avi'])
}

function findMimeType(file): FileType {
  let fileType = FileType.UNKNOWN
  if (file.type.startsWith('image/')) {
    fileType = FileType.IMAGE
  } else if (file.type.startsWith('audio/')) {
    fileType = FileType.AUDIO
  } else if (file.type.startsWith('video/')) {
    fileType = FileType.VIDEO
  } else if (file.name.endsWith('.gltf') || file.name.endsWith('.glb')) {
    fileType = FileType.THREE_D
  }

  return fileType
}

function isValidFileType(file): { isValid: boolean; errorMessage?: string } {
  const mimeType: FileType = findMimeType(file)
  const fileName = file.name
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()

  for (const [type, extensions] of Object.entries(supportedFiles)) {
    if (extensions.has(extension)) {
      return {
        isValid: true
      }
    }
  }

  return {
    isValid: false,
    errorMessage: unsupportedFileMessage[mimeType]
  }
}

function sanitizeFiles(files) {
  const newFiles: File[] = []
  for (const file of files) {
    const newFile = cleanFileNameFile(file)
    const { isValid, errorMessage } = isValidFileType(newFile)
    if (!isValid) {
      NotificationService.dispatchNotify(`${file.name} is not supported. ${errorMessage}`, { variant: 'warning' })
    }
    newFiles.push(newFile)
  }

  return newFiles
}

export const compressImage = async (properties: KTX2EncodeArguments) => {
  const ktx2Encoder = new KTX2Encoder()

  let img: CanvasImageSource
  if (properties.src instanceof Blob) {
    img = await createImageBitmap(properties.src)
  } else {
    img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = properties.src
    await img.decode()
  }
  const canvas = new OffscreenCanvas(img.width, img.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, img.width, img.height)

  const data = await ktx2Encoder.encode(imageData, {
    uastc: properties.mode === 'UASTC',
    qualityLevel: properties.quality,
    mipmaps: properties.mipmaps,
    compressionLevel: properties.compressionLevel,
    yFlip: properties.flipY,
    srgb: !properties.srgb,
    uastcFlags: properties.uastcFlags,
    normalMap: properties.normalMap,
    uastcZstandard: properties.uastcZstandard
  })

  return data
}

export const handleUploadFiles = (projectName: string, directoryPath: string, files: FileList | File[]) => {
  const { ktx2: compressedImage } = CommonKnownContentTypes
  const importSettingsState = getMutableState(ImportSettingsState)
  return Promise.all(
    Array.from(files).map(async (file) => {
      file = cleanFileNameFile(file)

      const ext = file.name.split('.').pop() ?? ''
      const contentType = CommonKnownContentTypes[ext] as string | null
      const isUncompressedImage = contentType != compressedImage && contentType?.startsWith('image')

      if (isUncompressedImage && importSettingsState.imageCompression.value) {
        const newFileName = file.name.replace(/.*\/(.*)\..*/, '$1').replace(/\.([^\.]+)$/, '-$1') + '.ktx2'
        const data = await compressImage({
          ...importSettingsState.imageSettings.value,
          src: file
        })
        file = new File([data], newFileName, { type: 'image/ktx2' })
      }

      const fileDirectory = file.webkitRelativePath || file.name

      return uploadToFeathersService(fileBrowserUploadPath, [file], {
        args: [
          {
            project: projectName,
            path: directoryPath.replace('projects/' + projectName + '/', '') + fileDirectory,
            type: 'asset',
            contentType: file.type
          }
        ]
      }).promise
    })
  )
}

/**
 * @param config
 * @param config.projectName input and upload the file to the assets directory of the project
 * @param config.directoryPath input and upload the file to the `directoryPath`
 */
export const inputFileWithAddToScene = ({
  projectName,
  directoryPath,
  preserveDirectory
}: {
  projectName: string
  directoryPath: string
  preserveDirectory?: boolean
}): Promise<null> =>
  new Promise((resolve, reject) => {
    const el = document.createElement('input')
    el.type = 'file'
    if (preserveDirectory) {
      el.setAttribute('webkitdirectory', 'webkitdirectory')
    }
    el.multiple = true
    el.style.display = 'none'

    el.onchange = async () => {
      try {
        if (el.files?.length) {
          const newFiles = sanitizeFiles(el.files)
          await handleUploadFiles(projectName, directoryPath, newFiles)
        }
        resolve(null)
        API.instance.service(fileBrowserPath).emit('created')
      } catch (err) {
        reject(err)
      } finally {
        el.remove()
      }
    }

    el.click()
  })

export const uploadProjectFiles = (projectName: string, files: File[], paths: string[], args?: object[]) => {
  const promises: CancelableUploadPromiseReturnType<string>[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileDirectory = paths[i].replace('projects/' + projectName + '/', '')
    const filePath = fileDirectory ? pathJoin(fileDirectory, file.name) : file.name
    const fileArgs = args?.[i] ?? {}
    promises.push(
      uploadToFeathersService(fileBrowserUploadPath, [file], {
        args: [{ contentType: '', ...fileArgs, project: projectName, path: filePath }]
      })
    )
  }

  return {
    cancel: () => promises.forEach((promise) => promise.cancel()),
    promises: promises.map((promise) => promise.promise)
  } as CancelableUploadPromiseArrayReturnType<string>
}

export async function clearModelResources(projectName: string, modelName: string) {
  const resourcePath = `projects/${projectName}/assets/${modelResourcesPath(modelName)}`
  const exists = await API.instance.service(fileBrowserPath).get(resourcePath)
  if (exists) {
    await API.instance.service(fileBrowserPath).remove(resourcePath)
  }
}

export const uploadProjectAssetsFromUpload = async (
  projectName: string,
  entries: FileSystemEntry[],
  onProgress = (...args: any[]) => {}
) => {
  const promises: CancelableUploadPromiseReturnType<string>[] = []

  for (let i = 0; i < entries.length; i++) {
    await processEntry(entries[i], projectName, '', promises, (progress) => onProgress(i + 1, entries.length, progress))
  }

  return {
    cancel: () => promises.forEach((promise) => promise.cancel()),
    promises: promises.map((promise) => promise.promise)
  } as CancelableUploadPromiseArrayReturnType<string>
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
 * @param item
 */
export const processEntry = async (
  item,
  projectName: string,
  directory: string,
  promises: CancelableUploadPromiseReturnType<string>[],
  onProgress
) => {
  if (item.isDirectory) {
    const directoryReader = item.createReader()
    const entries = await getEntries(directoryReader)
    for (let index = 0; index < entries.length; index++) {
      await processEntry(entries[index], projectName, item.fullPath, promises, onProgress)
    }
  }

  if (item.isFile) {
    const file = await getFile(item)
    const name = cleanFileNameString(file.name)
    const path = `assets${directory}/` + name

    promises.push(
      uploadToFeathersService(
        fileBrowserUploadPath,
        [file],
        { args: [{ project: projectName, path, contentType: file.type }] },
        onProgress
      )
    )
  }
}

/**
 * https://stackoverflow.com/a/53113059
 * @param fileEntry
 * @returns
 */
export const getFile = async (fileEntry: FileSystemFileEntry): Promise<File> => {
  try {
    return await new Promise((resolve, reject) => fileEntry.file(resolve, reject))
  } catch (err) {
    console.log(err)
    return null!
  }
}

export const getEntries = async (directoryReader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> => {
  try {
    return await new Promise((resolve, reject) => directoryReader.readEntries(resolve, reject))
  } catch (err) {
    console.log(err)
    return null!
  }
}

export const extractZip = async (path: string): Promise<any> => {
  try {
    const params = { path: path }
    await API.instance.service(assetLibraryPath).create(params)
  } catch (err) {
    console.error('error extracting zip: ', err)
  }
}

export const downloadBlobAsZip = (blob: Blob, fileName: string) => {
  const anchorElement = document.createElement('a')
  anchorElement.href = URL.createObjectURL(blob)
  anchorElement.download = fileName + '.zip'
  document.body.appendChild(anchorElement)
  anchorElement.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
  )
  document.body.removeChild(anchorElement)
}
