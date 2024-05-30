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
import { AssetType, assetPath } from '@etherealengine/common/src/schema.type.module'
import { cleanString } from '@etherealengine/common/src/utils/cleanString'
import { EntityUUID, UUIDComponent, UndefinedEntity } from '@etherealengine/ecs'
import { getComponent, getMutableComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { GLTFComponent } from '@etherealengine/engine/src/gltf/GLTFComponent'
import { GLTFDocumentState } from '@etherealengine/engine/src/gltf/GLTFDocumentState'
import { GLTFSourceState } from '@etherealengine/engine/src/gltf/GLTFState'
import { handleScenePaths } from '@etherealengine/engine/src/scene/functions/GLTFConversion'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { AssetParams } from '@etherealengine/server-core/src/assets/asset/asset.class'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { Paginated } from '@feathersjs/feathers'
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

export const renameScene = async (id: string, newURL: string, projectName: string, params?: AssetParams) => {
  try {
    return await Engine.instance.api.service(assetPath).patch(id, { assetURL: newURL, project: projectName }, params)
  } catch (error) {
    logger.error(error, 'Error in renaming project')
    throw error
  }
}

const fileServer = config.client.fileServer

export const saveSceneGLTF = async (
  sceneAssetID: string | null,
  projectName: string,
  sceneFile: string,
  signal: AbortSignal
) => {
  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const { rootEntity } = getState(EditorState)
  const sourceID = `${getComponent(rootEntity, UUIDComponent)}-${getComponent(rootEntity, GLTFComponent).src}`

  const sceneName = cleanString(sceneFile!.replace('.scene.json', '').replace('.gltf', ''))
  const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')

  const existingScene = (await Engine.instance.api.service(assetPath).find({
    query: { assetURL: `${currentSceneDirectory}/${sceneName}.gltf`, $limit: 1 }
  })) as Paginated<AssetType>

  if (existingScene.data.length > 0) throw new Error(i18n.t('editor:errors.sceneAlreadyExists'))

  const gltfData = getState(GLTFDocumentState)[sourceID]
  if (!gltfData) {
    logger.error('Failed to save scene, no gltf data found')
  }
  const encodedGLTF = handleScenePaths(gltfData, 'encode')
  const blob = [JSON.stringify(encodedGLTF, null, 2)]
  const file = new File(blob, `${sceneName}.gltf`)

  const [[newPath]] = await Promise.all(uploadProjectFiles(projectName, [file], [currentSceneDirectory]).promises)

  const assetURL = newPath.replace(fileServer, '').slice(1) // remove leading slash

  if (sceneAssetID) {
    const result = await Engine.instance.api.service(assetPath).patch(sceneAssetID, { assetURL, project: projectName })

    // no need to update state if the assetURL is the same
    if (getState(EditorState).scenePath === result.assetURL && getState(EditorState).sceneAssetID === result.id) return

    getMutableState(EditorState).merge({
      sceneName,
      scenePath: assetURL,
      projectName,
      sceneAssetID: result.id
    })

    return
  }
  const result = await Engine.instance.api.service(assetPath).create({ assetURL, project: projectName, isScene: true })

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
    const sceneData = await Engine.instance.api.service(assetPath).create({
      project: projectName,
      isScene: true,
      sourceURL: 'projects/default-project/public/scenes/default.gltf',
      assetURL: `projects/${projectName}/public/scenes/New-Scene.gltf`
    })
    if (!sceneData) return
    const sceneName = sceneData.assetURL.split('/').pop()
    const newProjectName = sceneData.projectName

    getMutableState(EditorState).merge({
      sceneName,
      scenePath: sceneData.assetURL,
      projectName: newProjectName,
      sceneAssetID: sceneData.id
    })
  } catch (error) {
    logger.error(error)
  }
}

export const setCurrentEditorScene = (sceneURL: string, uuid: EntityUUID) => {
  const gltfEntity = GLTFSourceState.load(fileServer + '/' + sceneURL, uuid)
  getMutableComponent(Engine.instance.viewerEntity, SceneComponent).children.merge([gltfEntity])
  getMutableState(EditorState).rootEntity.set(gltfEntity)
  return () => {
    getMutableState(EditorState).rootEntity.set(UndefinedEntity)
    GLTFSourceState.unload(gltfEntity)
  }
}
