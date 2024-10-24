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

import getImagePalette from 'image-palette-core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'

import { EntityUUID } from '@ir-engine/ecs'
import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import { uploadProjectFiles } from '@ir-engine/editor/src/functions/assetFunctions'
import { takeScreenshot } from '@ir-engine/editor/src/functions/takeScreenshot'
import { generateEnvmapBake } from '@ir-engine/editor/src/functions/uploadEnvMapBake'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import {
  blurAndScaleImageData,
  convertImageDataToKTX2Blob,
  imageDataToBlob
} from '@ir-engine/engine/src/scene/classes/ImageUtils'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { getState, useHookstate, useState } from '@ir-engine/hyperflux'
import { ImageLink } from '@ir-engine/ui/editor'
import { RiLandscapeLine } from 'react-icons/ri'
import Button from '../../../../../primitives/tailwind/Button'
import ColorInput from '../../../../../primitives/tailwind/Color'
import LoadingView from '../../../../../primitives/tailwind/LoadingView'
import ComponentDropdown from '../../../ComponentDropdown'
import BooleanInput from '../../../input/Boolean'
import InputGroup from '../../../input/Group'
import NodeInput from '../../../input/Node'
import NumericInput from '../../../input/Numeric'

export const SceneSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const sceneSettingsComponent = useComponent(props.entity, SceneSettingsComponent)
  const state = useHookstate({
    thumbnailURL: null as string | null,
    thumbnail: null as File | null,
    uploadingThumbnail: false,
    loadingScreenURL: null as string | null,
    loadingScreenImageData: null as ImageData | null,
    uploadingLoadingScreen: false,
    resolution: 2048
  })

  const createThumbnail = async () => {
    const thumbnailBlob = await takeScreenshot(512, 320, 'jpeg')
    if (!thumbnailBlob) return
    const thumbnailURL = URL.createObjectURL(thumbnailBlob)
    const sceneName = getState(EditorState).sceneName!.split('.').slice(0, -1).join('.')
    const file = new File([thumbnailBlob!], sceneName + '.thumbnail.jpg')
    state.merge({
      thumbnailURL,
      thumbnail: file
    })
  }

  const uploadThumbnail = async () => {
    if (!state.thumbnail.value) return
    state.uploadingThumbnail.set(true)
    const editorState = getState(EditorState)
    const projectName = editorState.projectName!
    const currentSceneDirectory = getState(EditorState).scenePath!.split('/').slice(0, -1).join('/')
    const { promises } = uploadProjectFiles(projectName, [state.thumbnail.value], [currentSceneDirectory])
    const [[savedThumbnailURL]] = await Promise.all(promises)
    commitProperty(SceneSettingsComponent, 'thumbnailURL')(savedThumbnailURL)
    state.merge({
      thumbnailURL: null,
      thumbnail: null,
      uploadingThumbnail: false
    })
  }

  const createLoadingScreen = async () => {
    const envmapImageData = generateEnvmapBake(state.resolution.value)
    const blob = await imageDataToBlob(envmapImageData)
    state.merge({
      loadingScreenURL: URL.createObjectURL(blob!),
      loadingScreenImageData: envmapImageData
    })
  }

  const uploadLoadingScreen = async () => {
    const envmapImageData = state.loadingScreenImageData.value
    if (!envmapImageData) return
    state.uploadingLoadingScreen.set(true)

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
    commitProperty(SceneSettingsComponent, 'loadingScreenURL')(cleanURL.href)
    state.merge({
      loadingScreenURL: null,
      loadingScreenImageData: null,
      uploadingLoadingScreen: false
    })
  }

  const generateColors = () => {
    const url = state.thumbnailURL.value ?? sceneSettingsComponent.thumbnailURL.value
    if (!url) return
    const image = new Image()
    image.crossOrigin = 'Anonymous'
    image.onload = () => {
      const palette = getImagePalette(image)
      if (palette) {
        commitProperties(SceneSettingsComponent, {
          primaryColor: palette.color,
          backgroundColor: palette.backgroundColor,
          alternativeColor: palette.alternativeColor
        })
      }
    }
    image.src = url
  }

  const useSpectatingEntity = useState(sceneSettingsComponent.spectateEntity.value !== null)

  return (
    <ComponentDropdown
      name={t('editor:properties.sceneSettings.name')}
      description={t('editor:properties.sceneSettings.description')}
      Icon={SceneSettingsEditor.iconComponent}
    >
      <InputGroup
        name="Spectate Entity"
        label={t('editor:properties.sceneSettings.lbl-spectate')}
        info={t('editor:properties.sceneSettings.info-spectate')}
      >
        <BooleanInput
          value={useSpectatingEntity.value}
          onChange={(value) => {
            useSpectatingEntity.set(value)
            commitProperty(
              SceneSettingsComponent,
              'spectateEntity'
            )(useSpectatingEntity.value ? ('' as EntityUUID) : null)
          }}
        />
      </InputGroup>
      {useSpectatingEntity.value ? (
        <InputGroup
          name="Entity UUID"
          label={t('editor:properties.sceneSettings.lbl-uuid')}
          info={t('editor:properties.sceneSettings.info-uuid')}
        >
          <NodeInput
            value={sceneSettingsComponent.spectateEntity.value ?? ('' as EntityUUID)}
            onRelease={commitProperty(SceneSettingsComponent, `spectateEntity`)}
            onChange={commitProperty(SceneSettingsComponent, `spectateEntity`)}
          />
        </InputGroup>
      ) : (
        <></>
      )}

      <InputGroup
        name="Thumbnail"
        label={t('editor:properties.sceneSettings.lbl-thumbnail')}
        info={t('editor:properties.sceneSettings.info-thumbnail')}
        className="w-auto"
      >
        <div>
          <ImageLink src={state.thumbnailURL.value ?? sceneSettingsComponent.thumbnailURL.value} />

          <Button onClick={createThumbnail} className="mt-2 w-full">
            {t('editor:properties.sceneSettings.generate')}
          </Button>
          {state.uploadingThumbnail.value ? (
            <LoadingView spinnerOnly />
          ) : (
            <Button onClick={uploadThumbnail} disabled={!state.thumbnail.value} className="mt-2 w-full">
              {t('editor:properties.sceneSettings.save')}
            </Button>
          )}
        </div>
      </InputGroup>
      <InputGroup
        name="Loading Screen"
        label={t('editor:properties.sceneSettings.lbl-loading')}
        info={t('editor:properties.sceneSettings.info-loading')}
        className="w-auto"
      >
        <div>
          <ImageLink src={state.loadingScreenURL.value ?? sceneSettingsComponent.loadingScreenURL.value} />
          <Button onClick={createLoadingScreen} className="mt-2 w-full">
            {t('editor:properties.sceneSettings.generate')}
          </Button>
          {state.uploadingLoadingScreen.value ? (
            <LoadingView spinnerOnly />
          ) : (
            <Button
              onClick={uploadLoadingScreen}
              disabled={!state.loadingScreenImageData.value}
              className="mt-2 w-full"
            >
              {t('editor:properties.sceneSettings.save')}
            </Button>
          )}
        </div>
      </InputGroup>
      <InputGroup name="Primary Color" label={t('editor:properties.sceneSettings.lbl-colors')}>
        <div className="w-full space-y-2">
          <ColorInput
            disabled={!state.thumbnailURL.value && !sceneSettingsComponent.thumbnailURL.value}
            value={new Color(sceneSettingsComponent.primaryColor.value)}
            onChange={(val) => updateProperty(SceneSettingsComponent, 'primaryColor')('#' + val.getHexString())}
            onRelease={(val) => commitProperty(SceneSettingsComponent, 'primaryColor')('#' + val.getHexString())}
            className="w-full"
          />
          <ColorInput
            disabled={!state.thumbnailURL.value && !sceneSettingsComponent.thumbnailURL.value}
            value={new Color(sceneSettingsComponent.backgroundColor.value)}
            onChange={(val) => updateProperty(SceneSettingsComponent, 'backgroundColor')('#' + val.getHexString())}
            onRelease={(val) => commitProperty(SceneSettingsComponent, 'backgroundColor')('#' + val.getHexString())}
            className="w-full"
          />
          <ColorInput
            disabled={!state.thumbnailURL.value && !sceneSettingsComponent.thumbnailURL.value}
            value={new Color(sceneSettingsComponent.alternativeColor.value)}
            onChange={(val) => updateProperty(SceneSettingsComponent, 'alternativeColor')('#' + val.getHexString())}
            onRelease={(val) => commitProperty(SceneSettingsComponent, 'alternativeColor')('#' + val.getHexString())}
            className="w-full"
          />
          <Button onClick={generateColors} className="w-full">
            {t('editor:properties.sceneSettings.generate')}
          </Button>
        </div>
      </InputGroup>

      <InputGroup name="Kill Height" label={t('editor:properties.sceneSettings.lbl-killHeight')}>
        <NumericInput
          value={sceneSettingsComponent.sceneKillHeight.value}
          onChange={updateProperty(SceneSettingsComponent, 'sceneKillHeight')}
          onRelease={commitProperty(SceneSettingsComponent, 'sceneKillHeight')}
        />
      </InputGroup>
    </ComponentDropdown>
  )
}

SceneSettingsEditor.iconComponent = RiLandscapeLine
export default SceneSettingsEditor
