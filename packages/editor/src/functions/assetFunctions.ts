import { Object3D } from 'three'

import { API } from '@xrengine/client-core/src/API'
import {
  CancelableUploadPromiseArrayReturnType,
  CancelableUploadPromiseReturnType,
  uploadToFeathersService
} from '@xrengine/client-core/src/util/upload'
import { processFileName } from '@xrengine/common/src/utils/processFileName'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AssetComponent } from '@xrengine/engine/src/scene/components/AssetComponent'
import {
  Object3DComponent,
  Object3DComponentType,
  Object3DWithEntity
} from '@xrengine/engine/src/scene/components/Object3DComponent'
import { sceneToGLTF } from '@xrengine/engine/src/scene/functions/GLTFConversion'

import { accessEditorState } from '../services/EditorServices'

export const exportAsset = async (node: EntityTreeNode) => {
  const asset = getComponent(node.entity, AssetComponent)
  const projectName = accessEditorState().projectName.value!
  const assetName = asset.name
  if (!(node.children && node.children.length > 0)) {
    console.warn('Exporting empty asset')
  }
  let dudObjs = new Array<[Entity, Object3DComponentType]>()
  const obj3ds = node.children
    ? node.children!.map((root) => {
        if (!hasComponent(root, Object3DComponent)) {
          const dudObj3d = new Object3D() as Object3DWithEntity
          dudObj3d.entity = root
          dudObjs.push([root, addComponent(root, Object3DComponent, { value: dudObj3d })])
        }
        return getComponent(root, Object3DComponent).value!
      })
    : []

  const exportable = sceneToGLTF(obj3ds as Object3DWithEntity[])
  const uploadable = new File([JSON.stringify(exportable)], `${assetName}.xre.gltf`)
  for (const [entity, dud] of dudObjs) {
    dud.value.removeFromParent()
    removeComponent(entity, Object3DComponent)
  }
  dudObjs = []
  return Promise.all(uploadProjectFile(projectName, [uploadable], true).promises)
}

function fileBrowserUpload(
  file: Blob,
  params: { fileName: string; path: string; contentType: string },
  onProgress: (progress: number) => any
): CancelableUploadPromiseReturnType {
  return uploadToFeathersService('file-browser/upload', file as any, params, onProgress)
}

export const uploadProjectFile = (projectName: string, files: File[], isAsset = false, onProgress?) => {
  const promises: CancelableUploadPromiseReturnType[] = []

  for (const file of files) {
    const path = `projects/${projectName}${isAsset ? '/assets' : ''}`
    promises.push(fileBrowserUpload(file, { fileName: file.name, path, contentType: '' }, onProgress))
  }

  return {
    cancel: () => promises.forEach((promise) => promise.cancel()),
    promises: promises.map((promise) => promise.promise)
  } as CancelableUploadPromiseArrayReturnType
}

export const uploadProjectAssetsFromUpload = async (projectName: string, entries: FileSystemEntry[], onProgress?) => {
  const promises: CancelableUploadPromiseReturnType[] = []

  for (let i = 0; i < entries.length; i++) {
    await processEntry(entries[i], projectName, '', promises, (progress) => onProgress(i + 1, entries.length, progress))
  }

  return {
    cancel: () => promises.forEach((promise) => promise.cancel()),
    promises: promises.map((promise) => promise.promise)
  } as CancelableUploadPromiseArrayReturnType
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
 * @param item
 */
const processEntry = async (
  item,
  projectName: string,
  directory: string,
  promises: CancelableUploadPromiseReturnType[],
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

    promises.push(fileBrowserUpload(file, { fileName: name, path, contentType: '' }, onProgress))
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
