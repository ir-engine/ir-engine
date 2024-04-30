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
import { UUIDComponent, UndefinedEntity } from '@etherealengine/ecs'
import { getComponent, getMutableComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { GLTFComponent } from '@etherealengine/engine/src/gltf/GLTFComponent'
import { GLTFSnapshotState, GLTFSourceState } from '@etherealengine/engine/src/gltf/GLTFState'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { AssetParams } from '@etherealengine/server-core/src/assets/asset/asset.class'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { EditorState } from '../services/EditorServices'
import { uploadProjectFiles } from './assetFunctions'

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

export const saveSceneGLTF = async (
  sceneAssetID: string | null,
  projectName: string,
  sceneName: string,
  signal: AbortSignal
) => {
  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const { rootEntity } = getState(EditorState)
  const sourceID = `${getComponent(rootEntity, UUIDComponent)}-${getComponent(rootEntity, GLTFComponent).src}`

  sceneName = sceneName!.replace('.scene.json', '').replace('.gltf', '')

  const gltfData = getState(GLTFSnapshotState)[sourceID].snapshots.at(-1)

  const blob = [JSON.stringify(gltfData, null, 2)]
  const file = new File(blob, `${sceneName}.gltf`)
  const [[newPath]] = await Promise.all(uploadProjectFiles(projectName, [file]).promises)

  const assetURL = new URL(newPath).pathname.slice(1) // remove leading slash

  const sceneNameWithoutExtension = sceneName.replace('.scene.json', '').replace('.gltf', '')

  if (sceneAssetID) {
    const result = await Engine.instance.api
      .service(assetPath)
      .patch(sceneAssetID, { name: sceneNameWithoutExtension, assetURL, project: projectName })

    getMutableState(EditorState).merge({
      sceneName,
      scenePath: assetURL,
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
    scenePath: assetURL,
    projectName,
    sceneAssetID: result.id
  })
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
  const gltfEntity = GLTFSourceState.load(fileServer + '/' + sceneURL)
  getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([gltfEntity])
  getMutableState(EditorState).rootEntity.set(gltfEntity)
  return () => {
    getMutableState(EditorState).rootEntity.set(UndefinedEntity)
    GLTFSourceState.unload(gltfEntity)
  }
}
