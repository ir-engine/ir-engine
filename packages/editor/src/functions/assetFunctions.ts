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

import { Object3D } from 'three'

import { API } from '@etherealengine/client-core/src/API'
import { FileBrowserService } from '@etherealengine/client-core/src/common/services/FileBrowserService'
import {
  CancelableUploadPromiseArrayReturnType,
  CancelableUploadPromiseReturnType,
  uploadToFeathersService
} from '@etherealengine/client-core/src/util/upload'
import { processFileName } from '@etherealengine/common/src/utils/processFileName'
import { modelResourcesPath } from '@etherealengine/engine/src/assets/functions/pathResolver'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent, hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import {
  GroupComponent,
  Object3DWithEntity,
  addObjectToGroup,
  removeObjectFromGroup
} from '@etherealengine/engine/src/scene/components/GroupComponent'
import { PrefabComponent } from '@etherealengine/engine/src/scene/components/PrefabComponent'
import { sceneToGLTF } from '@etherealengine/engine/src/scene/functions/GLTFConversion'
import { getState } from '@etherealengine/hyperflux'

import { EditorState } from '../services/EditorServices'

export const exportPrefab = async (entity: Entity) => {
  const node = getComponent(entity, EntityTreeComponent)
  const asset = getComponent(entity, PrefabComponent)
  const projectName = getState(EditorState).projectName ?? ''
  if (!(node.children && node.children.length > 0)) {
    console.warn('Exporting empty asset')
  }
  const dudObjs = new Array<Object3DWithEntity>()
  const obj3ds = new Array<Object3DWithEntity>()
  const frontier = new Array<Entity>(...node.children.filter((child) => hasComponent(child, EntityTreeComponent)))
  do {
    const entity = frontier.pop()! as Entity
    if (getComponent(entity, GroupComponent)?.length) {
      const childObjs = getComponent(entity, GroupComponent).filter((obj) => !obj.type.includes('Helper'))
      obj3ds.push(...childObjs)
    } else {
      const dudObj = new Object3D() as Object3DWithEntity
      dudObj.entity = entity
      addObjectToGroup(entity, dudObj)
      dudObjs.push(dudObj)
      obj3ds.push(dudObj)
    }
    const prefabNode = getComponent(entity, EntityTreeComponent)
    const nodeChildren = prefabNode.children.filter((child) => !!child && hasComponent(child, EntityTreeComponent))
    frontier.push(...nodeChildren)
  } while (frontier.length > 0)

  const exportable = sceneToGLTF(obj3ds)
  const uploadable = new File([JSON.stringify(exportable)], asset.src)
  for (const dudObj of dudObjs) {
    removeObjectFromGroup(dudObj.entity, dudObj)
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
      uploadToFeathersService('file-browser/upload', [file], { fileName: name, path, contentType: '' }, onProgress)
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
    const parms = { path: path }
    await Engine.instance.api.service('asset-library').create(parms)
  } catch (err) {
    console.error('error extracting zip: ', err)
  }
}
