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

import i18n from 'i18next'

import config from '@etherealengine/common/src/config'
import multiLogger from '@etherealengine/common/src/logger'
import { assetPath } from '@etherealengine/common/src/schema.type.module'
import { parseStorageProviderURLs } from '@etherealengine/common/src/utils/parseSceneJSON'
import { EntityUUID, UUIDComponent, UndefinedEntity } from '@etherealengine/ecs'
import {
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { GLTFSourceState } from '@etherealengine/engine/src/gltf/GLTFState'
import { SceneSnapshotState, SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { GLTFLoadedComponent } from '@etherealengine/engine/src/scene/components/GLTFLoadedComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { AssetParams } from '@etherealengine/server-core/src/assets/asset/asset.class'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { iterateEntityNode } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { EditorState } from '../services/EditorServices'
import { uploadProjectFiles } from './assetFunctions'
import { exportRelativeGLTF } from './exportGLTF'

const logger = multiLogger.child({ component: 'editor:sceneFunctions' })

/**
 * deleteScene used to delete project using projectId.
 *
 * @param  {string}  sceneId
 * @return {Promise}
 */
export const deleteScene = async (sceneID: string): Promise<any> => {
  try {
    await Engine.instance.api.service(assetPath).remove(sceneID)
  } catch (error) {
    logger.error(error, 'Error in deleting project')
    throw error
  }
  return true
}

export const renameScene = async (id: string, name: string, params?: AssetParams) => {
  try {
    return await Engine.instance.api.service(assetPath).patch(id, { name }, params)
  } catch (error) {
    logger.error(error, 'Error in renaming project')
    throw error
  }
}

/**
 * saveScene used to save changes in existing project.
 *
 * @param {string} projectName
 * @param  {any}  sceneName
 * @param {File | null} thumbnailFile
 * @param  {any}  signal
 * @return {Promise}
 */
export const saveSceneJSON = async (
  sceneAssetID: string | null,
  projectName: string,
  sceneName: string,
  signal: AbortSignal
) => {
  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const sceneData = getState(SceneSnapshotState)[getState(EditorState).scenePath!].snapshots.at(-1)?.data

  if (!sceneData) throw new Error(i18n.t('editor:errors.sceneDataNotFound'))
  //remove gltf data from scene data
  for (const entityUUID of Object.keys(sceneData.entities)) {
    if (!sceneData.entities[entityUUID]) continue //entity has already been removed from save data
    const entity = UUIDComponent.getEntityByUUID(entityUUID as EntityUUID)
    if (hasComponent(entity, GLTFLoadedComponent)) {
      //delete anything that is a child of any GLTF-loaded entity
      iterateEntityNode(entity, (entity) => {
        if (!hasComponent(entity, UUIDComponent)) return
        delete sceneData.entities[getComponent(entity, UUIDComponent)]
      })
    }
  }

  const relativePath = sceneName.endsWith('.scene.json') ? sceneName : `${sceneName}.scene.json`

  const sceneNameWithoutExtension = sceneName.replace('.scene.json', '').replace('.gltf', '')

  const blob = [JSON.stringify(sceneData, null, 2)]
  const file = new File(blob, relativePath)
  const [[newPath]] = await Promise.all(uploadProjectFiles(projectName, [file]).promises)

  const assetURL = new URL(newPath).pathname.slice(1) // remove leading slash

  if (sceneAssetID) {
    const result = await Engine.instance.api
      .service(assetPath)
      .patch(sceneAssetID, { name: sceneNameWithoutExtension, assetURL, project: projectName })

    getMutableState(EditorState).merge({
      sceneName,
      scenePath: result.assetURL,
      projectName,
      sceneAssetID: result.id
    })

    return
  }
  const result = await Engine.instance.api
    .service(assetPath)
    .create({ name: sceneNameWithoutExtension, assetURL, project: projectName })

  getMutableState(EditorState).merge({
    sceneName,
    scenePath: result.assetURL,
    projectName,
    sceneAssetID: result.id
  })
}

export const saveSceneGLTF = async (
  sceneAssetID: string | null,
  projectName: string,
  sceneName: string,
  signal: AbortSignal
) => {
  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const editorState = getState(EditorState)

  const entity = SceneState.getRootEntity(editorState.scenePath!)

  if (!entity) throw new Error(i18n.t('editor:errors.sceneEntityNotFound'))

  sceneName = sceneName!.replace('.scene.json', '')

  const relativePath = `${sceneName!.replace('.scene.json', '')}.gltf`

  /** @todo remove once .scene.json support is removed */
  const isModel = hasComponent(entity, ModelComponent)
  if (!isModel) setComponent(entity, ModelComponent)
  await exportRelativeGLTF(entity, projectName!, relativePath)
  if (!isModel) removeComponent(entity, ModelComponent)

  const absolutePath = `projects/${projectName}/${relativePath}`

  const sceneNameWithoutExtension = sceneName.replace('.scene.json', '').replace('.gltf', '')

  if (sceneAssetID) {
    const result = await Engine.instance.api
      .service(assetPath)
      .patch(sceneAssetID, { name: sceneNameWithoutExtension, assetURL: absolutePath, project: projectName })

    getMutableState(EditorState).merge({
      sceneName,
      scenePath: absolutePath,
      projectName,
      sceneAssetID: result.id
    })

    return
  }
  const result = await Engine.instance.api
    .service(assetPath)
    .create({ name: sceneNameWithoutExtension, assetURL: absolutePath, project: projectName })

  getMutableState(EditorState).merge({
    sceneName,
    scenePath: absolutePath,
    projectName,
    sceneAssetID: result.id
  })

  // if (sceneName.endsWith('.scene.json')) {
  //   location.reload()
  // }
}

export const onNewScene = async () => {
  const { projectName } = getState(EditorState)
  if (!projectName) return

  try {
    const sceneData = await createNewScene(projectName)
    if (!sceneData) return

    getMutableState(EditorState).scenePath.set(sceneData.assetURL as any)
  } catch (error) {
    logger.error(error)
  }
}

export const createNewScene = async (projectName: string, params?: AssetParams) => {
  try {
    return Engine.instance.api.service(assetPath).create({ project: projectName }, params)
  } catch (error) {
    logger.error(error, 'Error in creating project')
    throw error
  }
}

const fileServer = config.client.fileServer

export const setCurrentEditorScene = (sceneURL: string) => {
  const isGLTF = sceneURL.endsWith('.gltf')
  if (isGLTF) {
    const gltfEntity = GLTFSourceState.load(fileServer + '/' + sceneURL)
    getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([gltfEntity])
    getMutableState(EditorState).rootEntity.set(gltfEntity)
    return () => {
      getMutableState(EditorState).rootEntity.set(UndefinedEntity)
      GLTFSourceState.unload(gltfEntity)
    }
  }

  let unmounted = false

  const sceneID = sceneURL.endsWith('.scene.json') ? sceneURL : sceneURL + '.scene.json'

  fetch(`${fileServer}/${sceneID}`).then(async (data) => {
    if (unmounted) return
    const sceneJSON = await data.json()
    if (unmounted) return
    const sceneRoot = SceneState.loadScene(sceneID, {
      scene: parseStorageProviderURLs(sceneJSON),
      name: sceneID.split('/')[2],
      thumbnailUrl: `${fileServer}/${sceneID.replace('.scene.json', '.thumbnail.jpg')}`,
      project: sceneID.split('/')[1]
    })
    if (sceneRoot) {
      getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([sceneRoot])
      getMutableState(EditorState).rootEntity.set(sceneRoot)
    }
  })

  return () => {
    unmounted = true
    SceneState.unloadScene(sceneID)
  }
}
