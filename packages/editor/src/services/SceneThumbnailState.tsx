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

import {
  blurAndScaleImageData,
  convertImageDataToKTX2Blob,
  imageDataToBlob
} from '@ir-engine/engine/src/scene/classes/ImageUtils'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { defineState, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { commitProperty } from '../components/properties/Util'
import { uploadProjectFiles } from '../functions/assetFunctions'
import { takeScreenshot } from '../functions/takeScreenshot'
import { generateEnvmapBake } from '../functions/uploadEnvMapBake'
import { EditorState } from './EditorServices'

export const SceneThumbnailState = defineState({
  name: 'ee.editor.SceneThumbnailState',
  initial: () => ({
    oldThumbnailURL: null as string | null,
    thumbnailURL: null as string | null,
    thumbnail: null as File | null,
    uploadingThumbnail: false,
    oldLoadingScreenURL: null as string | null,
    loadingScreenURL: null as string | null,
    loadingScreenImageData: null as ImageData | null,
    uploadingLoadingScreen: false,
    resolution: 2048
  }),
  createThumbnail: async () => {
    const thumbnailBlob = await takeScreenshot(512, 320)
    if (!thumbnailBlob) return
    const sceneName = getState(EditorState).sceneName!.split('.').slice(0, -1).join('.')
    const file = new File([thumbnailBlob!], sceneName + '.thumbnail.jpg')
    const sceneThumbnail = getMutableState(SceneThumbnailState)
    sceneThumbnail.merge({
      oldThumbnailURL: sceneThumbnail.thumbnailURL.value,
      thumbnailURL: URL.createObjectURL(thumbnailBlob),
      thumbnail: file
    })
  },
  uploadThumbnail: async (entity) => {
    const sceneThumbnailState = getMutableState(SceneThumbnailState)
    if (!sceneThumbnailState.thumbnail.value) return
    sceneThumbnailState.uploadingThumbnail.set(true)
    const currentThumbnail = sceneThumbnailState.thumbnailURL.value
    const editorState = getState(EditorState)
    const projectName = editorState.projectName!
    const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')
    const { promises } = uploadProjectFiles(projectName, [sceneThumbnailState.thumbnail.value], [currentSceneDirectory])
    const [[savedThumbnailURL]] = await Promise.all(promises)
    commitProperty(SceneSettingsComponent, 'thumbnailURL', [entity])(savedThumbnailURL)
    sceneThumbnailState.merge({
      thumbnailURL: null,
      oldThumbnailURL: currentThumbnail,
      thumbnail: null,
      uploadingThumbnail: false
    })
  },
  createLoadingScreen: async () => {
    const sceneThumbnailState = getMutableState(SceneThumbnailState)
    const envmapImageData = generateEnvmapBake(sceneThumbnailState.resolution.value)
    const blob = await imageDataToBlob(envmapImageData)
    const sceneThumbnail = getMutableState(SceneThumbnailState)
    sceneThumbnail.merge({
      oldLoadingScreenURL: sceneThumbnail.loadingScreenURL.value,
      loadingScreenURL: URL.createObjectURL(blob!),
      loadingScreenImageData: envmapImageData
    })
  },
  uploadLoadingScreen: async (entity) => {
    const sceneThumbnailState = getMutableState(SceneThumbnailState)
    const envmapImageData = sceneThumbnailState.loadingScreenImageData.value
    if (!envmapImageData) return
    sceneThumbnailState.uploadingLoadingScreen.set(true)

    const loadingScreenImageData = blurAndScaleImageData(envmapImageData, 2048, 2048, 6, 512)

    const [envmap, loadingScreen] = await Promise.all([
      convertImageDataToKTX2Blob(envmapImageData),
      convertImageDataToKTX2Blob(loadingScreenImageData)
    ])

    if (!envmap || !loadingScreen) return null!

    const editorState = getState(EditorState)
    const sceneName = editorState.sceneName!.split('.').slice(0, -1).join('.')
    const projectName = editorState.projectName!
    const envmapFilename = `${sceneName}.envmap.ktx2`
    const loadingScreenFilename = `${sceneName}.loadingscreen.ktx2`
    const currentLoadingScreen = sceneThumbnailState.loadingScreenURL.value

    const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')
    const promises = uploadProjectFiles(
      projectName,
      [new File([envmap], envmapFilename), new File([loadingScreen], loadingScreenFilename)],
      [currentSceneDirectory, currentSceneDirectory]
    )

    const [[envmapURL], [loadingScreenURL]] = await Promise.all(promises.promises)

    const cleanURL = new URL(loadingScreenURL)
    cleanURL.hash = ''
    cleanURL.search = ''
    commitProperty(SceneSettingsComponent, 'loadingScreenURL', [entity])(cleanURL.href)

    sceneThumbnailState.merge({
      loadingScreenURL: null,
      oldLoadingScreenURL: currentLoadingScreen,
      loadingScreenImageData: null,
      uploadingLoadingScreen: false
    })
  },
  reactor: () => {
    const editorState = useHookstate(getMutableState(EditorState))
    useEffect(() => {
      getMutableState(SceneThumbnailState).merge({
        oldLoadingScreenURL: null,
        oldThumbnailURL: null,
        loadingScreenURL: null,
        thumbnailURL: null,
        thumbnail: null,
        loadingScreenImageData: null
      })
    }, [editorState.scenePath])
    return null
  }
})
