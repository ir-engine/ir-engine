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

import { removeFromFileThumbnailsSeen } from '@ir-engine/client-core/src/common/services/FileThumbnailJobState'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import {
  CancelableUploadPromiseArrayReturnType,
  CancelableUploadPromiseReturnType,
  uploadToFeathersService
} from '@ir-engine/client-core/src/util/upload'
import { API } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import {
  assetLibraryPath,
  ffmpegPath,
  fileBrowserPath,
  fileBrowserUploadPath,
  staticResourcePath
} from '@ir-engine/common/src/schema.type.module'
import { CommonKnownContentTypes } from '@ir-engine/common/src/utils/CommonKnownContentTypes'
import { cleanFileNameFile, cleanFileNameString } from '@ir-engine/common/src/utils/cleanFileName'
import { isValidFileName } from '@ir-engine/common/src/utils/validateFileName'
import { KTX2EncodeArguments } from '@ir-engine/engine/src/assets/constants/CompressionParms'
import { pathJoin } from '@ir-engine/engine/src/assets/functions/miscUtils'
import { modelResourcesPath } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { getMutableState } from '@ir-engine/hyperflux'
import { KTX2Encoder } from '@ir-engine/xrui/core/textures/KTX2Encoder'
import i18n from 'i18next'
import { showGifFileConfimation, showMultipleFileModal } from '../panels/files/toolbar'
import { ImportSettingsState } from '../services/ImportSettingsState'

enum FileType {
  THREE_D = '3D',
  IMAGE = 'Image',
  AUDIO = 'Audio',
  VIDEO = 'Video',
  UNKNOWN = 'Unknown',
  GIF = 'GIF'
}

const unsupportedFileMessage = {
  [FileType.THREE_D]: 'editor:errors.unsupported-3D-file',
  [FileType.IMAGE]: 'editor:errors.unsupported-image-file',
  [FileType.AUDIO]: 'editor:errors.unsupported-audio-file',
  [FileType.VIDEO]: 'editor:errors.unsupported-video-file',
  [FileType.UNKNOWN]: 'editor:errors.unsupported-unknown-file'
}

const supportedFiles = {
  [FileType.THREE_D]: new Set(['.gltf', '.glb', '.bin']),
  [FileType.IMAGE]: new Set(['.png', '.jpg', '.jpeg', '.ktx2', '.gif']),
  [FileType.AUDIO]: new Set(['.mp3', '.mpeg', '.m4a', '.wav']),
  [FileType.VIDEO]: new Set(['.mp4', '.mkv', '.avi'])
}

function findMimeType(file: File): FileType {
  let fileType = FileType.UNKNOWN
  if (file.type.startsWith('image/')) {
    if (file.type.includes('gif')) {
      fileType = FileType.GIF
    } else {
      fileType = FileType.IMAGE
    }
  } else if (file.type.startsWith('audio/')) {
    fileType = FileType.AUDIO
  } else if (file.type.startsWith('video/')) {
    fileType = FileType.VIDEO
  } else if (file.name.endsWith('.gltf') || file.name.endsWith('.glb')) {
    fileType = FileType.THREE_D
  }

  return fileType
}

function isValidFileType(file, acceptedFileTypes?: string | undefined): { isValid: boolean; errorMessage?: string } {
  const mimeType: FileType = findMimeType(file)
  // check for the mimetype of file
  if (acceptedFileTypes && !acceptedFileTypes?.toLocaleLowerCase().includes(mimeType.toLocaleLowerCase())) {
    return {
      isValid: false,
      errorMessage: i18n.t(unsupportedFileMessage[mimeType])
    }
  }
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
    errorMessage: i18n.t(unsupportedFileMessage[mimeType])
  }
}

export function validatedFiles(files: FileList | File[], acceptedFileTypes?: string | undefined): File[] {
  const { maxFileSizeToUpload } = config.client
  const invalidSizeFiles: string[] = []
  const newFiles: File[] = []

  for (const file of files) {
    // Check file size
    if (file.size > maxFileSizeToUpload) {
      invalidSizeFiles.push(file.name)
      continue
    }

    // Check file type
    const { isValid: isValidType, errorMessage } = isValidFileType(file, acceptedFileTypes)
    if (!isValidType) {
      NotificationService.dispatchNotify(
        i18n.t('editor:errors.fileNotSupported', { file: file.name, errorMessage: errorMessage || '' }) as string,
        { variant: 'warning' }
      )
      continue
    }

    // Check filename
    const fileNameWithOutExtension = file.name.replace(/\.[^/.]+$/, '')
    const resultFileNameValid = isValidFileName(fileNameWithOutExtension)
    if (!resultFileNameValid.isValid) {
      NotificationService.dispatchNotify(resultFileNameValid.error, { variant: 'warning', autoHideDuration: 20000 })
      continue
    }
    newFiles.push(file)
  }

  if (invalidSizeFiles.length > 0) {
    NotificationService.dispatchNotify(
      i18n.t('editor:errors.maxUploadFileWeightExceed', {
        maxFileSizeToUploadMB: maxFileSizeToUpload / (1024 * 1024),
        fileNames: invalidSizeFiles.join(', ')
      }) as string,
      { variant: 'warning' }
    )
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

export const filterExistingFiles = async (projectName: string, directoryPath: string, files: File[]) => {
  if (!files.length) {
    return files
  }

  const resourcePaths = files.map((file) => `${directoryPath}${file.name}`)
  const { data: existingResources } = await API.instance.service(staticResourcePath).find({
    query: { key: { $in: resourcePaths || [] } }
  })

  const existingResourceKeys = new Set(existingResources.map((resource) => resource.key))

  const { existingFiles, uniqueFiles } = files.reduce(
    (result, file) => {
      const fileKey = `${directoryPath}${file.name}`
      if (existingResourceKeys.has(fileKey)) {
        result.existingFiles.push(file)
      } else {
        result.uniqueFiles.push(file)
      }
      return result
    },
    { existingFiles: [], uniqueFiles: [] } as { existingFiles: File[]; uniqueFiles: File[] }
  )

  if (existingFiles.length > 0) {
    showMultipleFileModal(projectName, directoryPath, existingFiles)
  }

  return uniqueFiles
}
export const filterGifFiles = async (projectName: string, directoryPath: string, files: File[]) => {
  if (!files.length) {
    return files
  }

  const { gifFiles, notGifFiles } = files.reduce(
    (result, file) => {
      const mimeType: FileType = findMimeType(file)
      if (mimeType === FileType.GIF) {
        result.gifFiles.push(file)
      } else {
        result.notGifFiles.push(file)
      }
      return result
    },
    { gifFiles: [], notGifFiles: [] } as { gifFiles: File[]; notGifFiles: File[] }
  )

  if (gifFiles.length > 0) {
    showGifFileConfimation(projectName, directoryPath, gifFiles)
  }
  return notGifFiles
}

// upload gif files and convert them to video and upload them returning the urls
export const handleConvertGifFileToVideoAndUpload = (
  projectName: string,
  directoryPath: string,
  files: FileList | File[],
  updateThumbnail = true
): Promise<string[]> => {
  return Promise.all(
    Array.from(files).map(async (file) => {
      file = cleanFileNameFile(file)

      const ext = file.name.split('.').pop() ?? ''
      const contentType = CommonKnownContentTypes[ext] as string | null

      const fileDirectory = file.webkitRelativePath || file.name
      console.log('fileDirectory', fileDirectory)
      return uploadToFeathersService(ffmpegPath, [file], {
        args: [
          {
            project: projectName,
            path: directoryPath.replace('projects/' + projectName + '/', '') + fileDirectory,
            type: 'asset',
            contentType: file.type
          }
        ]
      })
        .promise.then((response) => {
          if (!updateThumbnail) return response[0]
          //get the static resource record for this file, so we can make it's thumbnail null, since it was oerwritten
          const checkStaticResourceThumbnail = async (path) => {
            await API.instance
              .service(staticResourcePath)
              .find({
                query: { key: { $in: [path] } }
              })
              .then((reponse) => {
                if (reponse.data.length > 0) {
                  const staticResourceId = reponse.data[0].id
                  const updateStaticResourceThumbnail = async (id: string) => {
                    await API.instance
                      .service(staticResourcePath)
                      .patch(id, { thumbnailKey: null, thumbnailMode: null })
                  }
                  updateStaticResourceThumbnail(staticResourceId)
                }
              })
              .catch((e) => console.error(e))
            return path
          }
          const fileURL = new URL(response[0])
          fileURL.search = ''
          fileURL.hash = ''
          const file = fileURL.href.replace(config.client.fileServer + '/', '')
          removeFromFileThumbnailsSeen([file])
          return checkStaticResourceThumbnail(file)
        })
        .catch((e) => {
          NotificationService.dispatchNotify(i18n.t('editor:errors.fileUploadFailed', { reason: e }) as string, {
            variant: 'error',
            autoHideDuration: 20000
          })
        })
    })
  )
}

// uploads files and returns an array of uploaded urls
export const handleUploadFiles = (
  projectName: string,
  directoryPath: string,
  files: FileList | File[],
  updateThumbnail = true
): Promise<string[]> => {
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
      })
        .promise.then((response) => {
          if (!updateThumbnail) return response[0]
          //get the static resource record for this file, so we can make it's thumbnail null, since it was oerwritten
          const checkStaticResourceThumbnail = async (path) => {
            await API.instance
              .service(staticResourcePath)
              .find({
                query: { key: { $in: [path] } }
              })
              .then((reponse) => {
                if (reponse.data.length > 0) {
                  const staticResourceId = reponse.data[0].id
                  const updateStaticResourceThumbnail = async (id: string) => {
                    await API.instance
                      .service(staticResourcePath)
                      .patch(id, { thumbnailKey: null, thumbnailMode: null })
                  }
                  updateStaticResourceThumbnail(staticResourceId)
                }
              })
              .catch((e) => console.error(e))
            return path
          }
          const fileURL = new URL(response[0])
          fileURL.search = ''
          fileURL.hash = ''
          const file = fileURL.href.replace(config.client.fileServer + '/', '')
          removeFromFileThumbnailsSeen([file])
          return checkStaticResourceThumbnail(file)
        })
        .catch((e) => {
          NotificationService.dispatchNotify(i18n.t('editor:errors.fileUploadFailed', { reason: e }) as string, {
            variant: 'error',
            autoHideDuration: 20000
          })
        })
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
  preserveDirectory,
  updateThumbnail = true
}: {
  projectName: string
  directoryPath: string
  preserveDirectory?: boolean
  updateThumbnail?: boolean
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
          const newFiles = validatedFiles(el.files)
          const nonGifFiles = await filterGifFiles(projectName, directoryPath, newFiles)
          const uniqueFiles = await filterExistingFiles(projectName, directoryPath, nonGifFiles)
          await handleUploadFiles(projectName, directoryPath, uniqueFiles)
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

// creates a file uploader that can be used to upload a single file from the file system
const createFileUploader = ({
  projectName,
  directoryPath,
  preserveDirectory,
  acceptedFileTypes,
  updateThumbnail = true
}: {
  projectName: string
  directoryPath: string
  preserveDirectory?: boolean
  acceptedFileTypes: string
  updateThumbnail?: boolean
}): Promise<string> =>
  new Promise((resolve, reject) => {
    const el = document.createElement('input')
    el.type = 'file'
    if (preserveDirectory) {
      el.setAttribute('webkitdirectory', 'webkitdirectory')
    }
    el.multiple = false
    el.accept = acceptedFileTypes
    el.style.display = 'none'

    el.onchange = async () => {
      try {
        if (el.files?.length) {
          const newFiles = validatedFiles(el.files, acceptedFileTypes)
          const uniqueFiles = await filterExistingFiles(projectName, directoryPath, newFiles)
          const [uploadedFileUrl] = await handleUploadFiles(projectName, directoryPath, uniqueFiles, updateThumbnail)

          if (uploadedFileUrl) {
            resolve(uploadedFileUrl)
          } else {
            reject(new Error('No file was uploaded'))
          }
        } else {
          reject(new Error('No file selected'))
        }
        API.instance.service(fileBrowserPath).emit('created')
      } catch (err) {
        reject(err)
      } finally {
        el.remove()
      }
    }

    el.click()
  })

export const uploadImageFile = (params: {
  projectName: string
  directoryPath: string
  preserveDirectory?: boolean
  acceptedFileTypes?: string
}): Promise<string> =>
  createFileUploader({
    ...params,
    acceptedFileTypes: params.acceptedFileTypes ?? 'image/*',
    updateThumbnail: false
  })

// currently only supporting mp4
export const uploadVideoFile = (params: {
  projectName: string
  directoryPath: string
  preserveDirectory?: boolean
}): Promise<string> =>
  createFileUploader({
    ...params,
    acceptedFileTypes: 'video/mp4,.mp4',
    updateThumbnail: false
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
