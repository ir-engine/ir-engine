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

import { GLTF } from '@gltf-transform/core'
import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { clientContextParams } from '@ir-engine/client-core/src/util/ClientContextState'
import { createScene } from '@ir-engine/client-core/src/world/SceneAPI'
import { API } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import multiLogger from '@ir-engine/common/src/logger'
import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { cleanString } from '@ir-engine/common/src/utils/cleanString'
import { EngineState, EntityUUID, UndefinedEntity } from '@ir-engine/ecs'
import { Layers } from '@ir-engine/ecs/src/ComponentFunctions'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { AssetModifiedState, SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import { exportGLTFScene } from '@ir-engine/engine/src/gltf/exportGLTFScene'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import ErrorDialog from '@ir-engine/ui/src/components/tailwind/ErrorDialog'
import React from 'react'
import { EditorState } from '../services/EditorServices'
import { SceneThumbnailState } from '../services/SceneThumbnailState'
import { uploadProjectFiles } from './assetFunctions'

const logger = multiLogger.child({ component: 'editor:sceneFunctions', modifier: clientContextParams })

const fileServer = config.client.fileServer

export const confirmSceneExists = async (sceneFile: string) => {
  const sceneName = cleanString(sceneFile!.replace('.scene.json', '').replace('.gltf', ''))
  const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')

  const existingScene = await API.instance.service(staticResourcePath).find({
    query: { key: `${currentSceneDirectory}/${sceneName}.gltf`, $limit: 1 }
  })

  return existingScene.data.length > 0
}

export const saveSceneGLTF = async (
  sceneAssetID: string,
  projectName: string,
  sceneFile: string,
  signal: AbortSignal,
  saveAs?: boolean,
  savePath?: string
) => {
  if (signal.aborted) throw new Error(i18n.t('editor:errors.saveProjectAborted'))

  const { rootEntity } = getState(EditorState)

  const sceneName = cleanString(sceneFile!.replace('.scene.json', '').replace('.gltf', '')) + '.gltf'
  let currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')
  if (savePath) {
    currentSceneDirectory = savePath
  }
  if (saveAs) {
    const isSceneExists = await confirmSceneExists(sceneFile)
    if (isSceneExists) throw new Error(i18n.t('editor:errors.sceneAlreadyExists'))
  }

  const response = await exportGLTFScene(rootEntity, getState(EditorState).projectName!, sceneFile, false)
  const gltfData = response[0] as GLTF.IGLTF
  const files = response.slice(1) as File[]

  if (!gltfData) {
    logger.error('Failed to save scene, no gltf data found')
  }

  const blob = [new Blob([JSON.stringify(gltfData, null, 2)], { type: 'model/gltf+json' })]
  const gltfFile = new File(blob, sceneName, { type: 'model/gltf+json' })

  const currentScene = await API.instance.service(staticResourcePath).get(sceneAssetID)

  const [[newPath]] = await Promise.all(
    uploadProjectFiles(
      projectName,
      [gltfFile, ...files],
      [currentSceneDirectory],
      [
        {
          type: 'scene',
          contentType: 'model/gltf+json',
          thumbnailKey: currentScene.thumbnailKey ?? ''
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

export const logNewScene = (authoringApp: string, entryPoint: string = 'editor') => {
  logger.analytics({
    app_name: 'editor',
    project: getState(EditorState).projectName,
    user_id: getState(EngineState).userID,
    event_name: 'editor',
    event_value: 'new-scene',
    event_properties: [
      {
        key: 'authoring-app',
        value: authoringApp
      },
      {
        key: 'entry-point',
        value: entryPoint
      }
    ]
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
  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  const unload = SceneState.loadScene(sceneURL, uuid, viewerEntity, Layers.Authoring)
  const gltfEntity = getState(SceneState)[sceneURL]
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

  try {
    await SceneThumbnailState.createThumbnail()
    await SceneThumbnailState.uploadThumbnail()
  } catch (error) {
    console.error(error)
  }

  if (!sceneModified) {
    ModalState.closeModal()
    NotificationService.dispatchNotify(`${i18n.t('editor:dialog.saveScene.info-save-success')}`, { variant: 'success' })
    return
  }

  const abortController = new AbortController()

  try {
    await saveSceneGLTF(sceneAssetID!, projectName!, sceneName!, abortController.signal)
    NotificationService.dispatchNotify(`${i18n.t('editor:dialog.saveScene.info-save-success')}`, { variant: 'success' })
    const sourceID = GLTFComponent.getInstanceID(rootEntity)
    getMutableState(AssetModifiedState)[sourceID].set(none)

    ModalState.closeModal()
  } catch (error) {
    console.error(error)
    ModalState.openModal(
      <ErrorDialog
        title={i18n.t('editor:savingError')}
        description={error.message || i18n.t('editor:savingErrorMsg')}
      />
    )
  }
}
