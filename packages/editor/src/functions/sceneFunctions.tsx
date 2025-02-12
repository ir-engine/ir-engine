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

import i18n from 'i18next'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { createScene } from '@ir-engine/client-core/src/world/SceneAPI'
import { API } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import multiLogger from '@ir-engine/common/src/logger'
import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { cleanString } from '@ir-engine/common/src/utils/cleanString'
import { EntityUUID, UndefinedEntity } from '@ir-engine/ecs'
import { getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { GLTFDocumentState, GLTFModifiedState } from '@ir-engine/engine/src/gltf/GLTFDocumentState'
import { GLTFAssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { handleScenePaths } from '@ir-engine/engine/src/scene/functions/GLTFConversion'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import ErrorDialog from '@ir-engine/ui/src/components/tailwind/ErrorDialog'
import React from 'react'
import { EditorState } from '../services/EditorServices'
import { uploadProjectFiles } from './assetFunctions'

const logger = multiLogger.child({ component: 'editor:sceneFunctions' })

const fileServer = config.client.fileServer

export const saveSceneGLTF = async (
  sceneAssetID: string,
  projectName: string,
  sceneFile: string,
  signal: AbortSignal,
  saveAs?: boolean
) => {
  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const { rootEntity } = getState(EditorState)
  const sourceID = GLTFComponent.getInstanceID(rootEntity)

  const sceneName = cleanString(sceneFile!.replace('.scene.json', '').replace('.gltf', ''))
  const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')

  if (saveAs) {
    const existingScene = await API.instance.service(staticResourcePath).find({
      query: { key: `${currentSceneDirectory}/${sceneName}.gltf`, $limit: 1 }
    })

    if (existingScene.data.length > 0) throw new Error(i18n.t('editor:errors.sceneAlreadyExists'))
  }

  const gltfData = getState(GLTFDocumentState)[sourceID]
  if (!gltfData) {
    logger.error('Failed to save scene, no gltf data found')
  }
  const encodedGLTF = handleScenePaths(gltfData, 'encode')
  const blob = [JSON.stringify(encodedGLTF, null, 2)]
  const file = new File(blob, `${sceneName}.gltf`)

  const currentScene = await API.instance.service(staticResourcePath).get(sceneAssetID)

  const [[newPath]] = await Promise.all(
    uploadProjectFiles(
      projectName,
      [file],
      [currentSceneDirectory],
      [
        {
          type: 'scene',
          contentType: 'model/gltf+json',
          thumbnailKey: currentScene.thumbnailKey
        }
      ]
    ).promises
  )

  const newURL = new URL(newPath)
  newURL.hash = ''
  newURL.search = ''
  const assetURL = newURL.href.replace(fileServer, '').slice(1) // remove leading slash

  const result = await API.instance.service(staticResourcePath).find({
    query: { key: assetURL, $limit: 1 }
  })

  if (result.total !== 1) {
    throw new Error(i18n.t('editor:errors.sceneSaveFailed'))
  }

  getMutableState(EditorState).merge({
    sceneName,
    scenePath: assetURL,
    projectName,
    sceneAssetID: result.data[0].id
  })
}

export const onNewScene = async (
  templateURL = config.client.fileServer + '/projects/ir-engine/default-project/public/scenes/default.gltf'
) => {
  const { projectName } = getState(EditorState)
  if (!projectName) return

  try {
    const sceneData = await createScene(projectName, templateURL)
    if (!sceneData) return
    const sceneName = sceneData.key.split('/').pop()

    getMutableState(EditorState).merge({
      sceneName,
      scenePath: sceneData.key,
      projectName: projectName,
      sceneAssetID: sceneData.id
    })
  } catch (error) {
    logger.error(error)
  }
}

export const setCurrentEditorScene = (sceneURL: string, uuid: EntityUUID) => {
  getMutableState(EngineState).isEditing.set(true)
  const unload = GLTFAssetState.loadScene(sceneURL, uuid)
  const gltfEntity = getState(GLTFAssetState)[sceneURL]
  setComponent(gltfEntity, SceneComponent)
  getMutableState(EditorState).rootEntity.set(gltfEntity)
  return () => {
    unload()
    getMutableState(EditorState).rootEntity.set(UndefinedEntity)
  }
}

/**
 * onSaveScene
 *
 * @returns Promise<void>
 */
export const onSaveScene = async () => {
  const { sceneAssetID, projectName, sceneName, rootEntity } = getState(EditorState)
  const sceneModified = EditorState.isModified()

  if (!sceneModified) {
    PopoverState.hidePopupover()
    NotificationService.dispatchNotify(`${i18n.t('editor:dialog.saveScene.info-save-success')}`, { variant: 'success' })
    return
  }

  const abortController = new AbortController()

  try {
    await saveSceneGLTF(sceneAssetID!, projectName!, sceneName!, abortController.signal)
    NotificationService.dispatchNotify(`${i18n.t('editor:dialog.saveScene.info-save-success')}`, { variant: 'success' })
    const sourceID = getComponent(rootEntity, SourceComponent)
    getMutableState(GLTFModifiedState)[sourceID].set(none)

    PopoverState.hidePopupover()
  } catch (error) {
    console.error(error)
    PopoverState.showPopupover(
      <ErrorDialog
        title={i18n.t('editor:savingError')}
        description={error.message || i18n.t('editor:savingErrorMsg')}
      />
    )
  }
}
