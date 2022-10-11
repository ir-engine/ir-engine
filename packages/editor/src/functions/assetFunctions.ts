import { Object3D } from 'three'

import { API } from '@xrengine/client-core/src/API'
import { FileBrowserService } from '@xrengine/client-core/src/common/services/FileBrowserService'
import {
  CancelableUploadPromiseArrayReturnType,
  CancelableUploadPromiseReturnType,
  uploadToFeathersService
} from '@xrengine/client-core/src/util/upload'
import { processFileName } from '@xrengine/common/src/utils/processFileName'
import { modelResourcesPath, pathResolver } from '@xrengine/engine/src/assets/functions/pathResolver'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import {
  addComponent,
  ComponentType,
  getComponent,
  hasComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { AssetComponent } from '@xrengine/engine/src/scene/components/AssetComponent'
import { GroupComponent, Object3DWithEntity } from '@xrengine/engine/src/scene/components/GroupComponent'
import { sceneToGLTF } from '@xrengine/engine/src/scene/functions/GLTFConversion'

import { accessEditorState } from '../services/EditorServices'

export const exportAsset = async (node: EntityTreeNode) => {
  const asset = getComponent(node.entity, AssetComponent)
  const projectName = accessEditorState().projectName.value!
  const assetName = asset.name
  if (!(node.children && node.children.length > 0)) {
    console.warn('Exporting empty asset')
  }
  const dudEntities = new Array<Entity>()
  const obj3ds = new Array<Object3DWithEntity>()

  for (const entity of node.children) {
    if (!getComponent(entity, GroupComponent)) dudEntities.push(entity)
    else obj3ds.push(...getComponent(entity, GroupComponent))
  }

  const exportable = sceneToGLTF(obj3ds)
  const uploadable = new File([JSON.stringify(exportable)], `${assetName}.xre.gltf`)
  for (const entity of dudEntities) {
    removeComponent(entity, GroupComponent)
  }
  return uploadProjectFiles(projectName, [uploadable], true).promises[0]
}

export const uploadProjectFiles = (projectName: string, files: File[], isAsset = false, onProgress?) => {
  const promises: CancelableUploadPromiseReturnType<string>[] = []

  for (const file of files) {
    const path = `projects/${projectName}${isAsset ? '/assets' : ''}`
    promises.push(
      uploadToFeathersService('file-browser/upload', [file], { fileName: file.name, path, contentType: '' }, onProgress)
    )
  }

  return {
    cancel: () => promises.forEach((promise) => promise.cancel()),
    promises: promises.map((promise) => promise.promise)
  } as CancelableUploadPromiseArrayReturnType<string>
}

export async function clearModelResources(projectName: string, modelName: string) {
  const resourcePath = `projects/${projectName}/assets/${modelResourcesPath(modelName)}`
  const { type: pathType } = await API.instance.client.service('file-browser').find({ query: { key: resourcePath } })
  pathType !== 'UNDEFINED' && (await FileBrowserService.deleteContent(resourcePath, ''))
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
const processEntry = async (
  item,
  projectName: string,
  directory: string,
  promises: CancelableUploadPromiseReturnType<string>[],
  onProgress
) => {
  if (item.isDirectory) {
    let directoryReader = item.createReader()
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
      uploadToFeathersService('file-browser/upload', [file], { fileName: name, path, contentType: '' }, onProgress)
    )
  }
}

/**
 * https://stackoverflow.com/a/53113059
 * @param fileEntry
 * @returns
 */
const getFile = async (fileEntry: FileSystemFileEntry): Promise<File> => {
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
    const parms = { path: path }
    await API.instance.client.service('asset-library').create(parms)
  } catch (err) {
    throw err
  }
}
