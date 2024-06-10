/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  CancelableUploadPromiseArrayReturnType,
  CancelableUploadPromiseReturnType,
  uploadToFeathersService
} from '@etherealengine/client-core/src/util/upload'
import multiLogger from '@etherealengine/common/src/logger'
import { assetLibraryPath, fileBrowserPath, fileBrowserUploadPath } from '@etherealengine/common/src/schema.type.module'
import { processFileName } from '@etherealengine/common/src/utils/processFileName'
import { Engine } from '@etherealengine/ecs'
import { ModelFormat } from '@etherealengine/engine/src/assets/classes/ModelTransform'
import { modelResourcesPath } from '@etherealengine/engine/src/assets/functions/pathResolver'
import { Heuristic } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { getState } from '@etherealengine/hyperflux'

import { ImportSettingsState } from '../components/assets/ImportSettingsPanel'
import { createLODVariants } from '../components/assets/ModelCompressionPanel'
import { LODVariantDescriptor } from '../constants/GLTFPresets'

const logger = multiLogger.child({ component: 'editor:assetFunctions' })

/**
 * @param config
 * @param config.uploadAsProjectFiles will be uploaded to the assets directory of the project
 * @param config.projectName input and upload the file to the assets directory of the project
 * @param config.directoryPath input and upload the file to the `directoryPath`
 */
export const inputFileWithAddToScene = async ({
  uploadAsProjectFiles,
  projectName,
  directoryPath
}: {
  projectName: string
  uploadAsProjectFiles?: boolean
  directoryPath?: string
}): Promise<null> =>
  new Promise((resolve, reject) => {
    const el = document.createElement('input')
    el.type = 'file'
    el.multiple = true
    el.accept =
      '.bin,.gltf,.glb,.fbx,.vrm,.tga,.png,.jpg,.jpeg,.mp3,.aac,.ogg,.m4a,.zip,.mp4,.mkv,.avi,.m3u8,.usdz,.vrm'
    el.style.display = 'none'

    el.onchange = async () => {
      try {
        let uploadedURLs: string[] = []
        if (el.files && el.files.length > 0) {
          const files = Array.from(el.files)
          if (uploadAsProjectFiles) {
            const importSettings = getState(ImportSettingsState)
            uploadedURLs = (
              await Promise.all(
                uploadProjectFiles(
                  projectName,
                  files,
                  files.map(() => `projects/${projectName}${importSettings.importFolder}`)
                ).promises
              )
            ).map((url) => url[0])
            for (const url of uploadedURLs) {
              if (url.endsWith('.gltf') || url.endsWith('.glb') || url.endsWith('.wrm')) {
                const importSettings = getState(ImportSettingsState)
                if (importSettings.LODsEnabled) {
                  const LODSettings = JSON.parse(JSON.stringify(importSettings.selectedLODS)) as LODVariantDescriptor[]
                  for (const lod of LODSettings) {
                    const fileName = url.match(/\/([^\/]+)\.\w+$/)!
                    const fileType = url.match(/\.(\w+)$/)!
                    const dst = (fileName[1] + lod.suffix).replace(/\s/g, '')

                    lod.params.src = url
                    lod.params.dst = `${importSettings.LODFolder}${dst}`
                    lod.params.modelFormat = fileType[1] as ModelFormat
                  }
                  await createLODVariants(LODSettings, true, Heuristic.BUDGET, true)
                }
              }
            }
          } else if (directoryPath) {
            uploadedURLs = await Promise.all(
              files.map(
                (file) =>
                  uploadToFeathersService(fileBrowserUploadPath, [file], {
                    fileName: file.name,
                    path: directoryPath,
                    project: projectName,
                    contentType: ''
                  }).promise
              )
            )
          }

          await Promise.all(uploadedURLs.filter((url) => /\.zip$/.test(url)).map(extractZip)).then(() =>
            logger.info('zip files extracted')
          )

          // if (projectName) {
          //   uploadedURLs.forEach((url) => addMediaNode(url))
          // }

          resolve(null)
        }
      } catch (err) {
        reject(err)
      }
    }

    el.click()
    el.remove()
  })

export const uploadProjectFiles = (projectName: string, files: File[], paths: string[], onProgress?) => {
  const promises: CancelableUploadPromiseReturnType<string>[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const path = paths[i]
    promises.push(
      uploadToFeathersService(fileBrowserUploadPath, [file], { fileName: file.name, path, contentType: '' }, onProgress)
    )
  }

  const uploadPromises = [...promises]
  Promise.all(uploadPromises).then(() =>
    Engine.instance.api.service('project-resources').create({ project: projectName })
  )

  return {
    cancel: () => promises.forEach((promise) => promise.cancel()),
    promises: promises.map((promise) => promise.promise)
  } as CancelableUploadPromiseArrayReturnType<string>
}

export async function clearModelResources(projectName: string, modelName: string) {
  const resourcePath = `projects/${projectName}/assets/${modelResourcesPath(modelName)}`
  const exists = await Engine.instance.api.service(fileBrowserPath).get(resourcePath)
  if (exists) {
    await Engine.instance.api.service(fileBrowserPath).remove(resourcePath)
  }
}

export const uploadProjectAssetsFromUpload = async (projectName: string, entries: FileSystemEntry[], onProgress?) => {
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
    const path = `projects/${projectName}/assets${directory}`
    const name = processFileName(file.name)

    promises.push(
      uploadToFeathersService(fileBrowserUploadPath, [file], { fileName: name, path, contentType: '' }, onProgress)
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
    await Engine.instance.api.service(assetLibraryPath).create(params)
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
