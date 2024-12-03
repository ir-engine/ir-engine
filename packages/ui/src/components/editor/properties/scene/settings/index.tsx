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
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SceneThumbnailState } from '@ir-engine/editor/src/services/SceneThumbnailState'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { getMutableState, useState } from '@ir-engine/hyperflux'
import { Checkbox } from '@ir-engine/ui'
import { ImageLink } from '@ir-engine/ui/editor'
import { RiLandscapeLine } from 'react-icons/ri'
import Button from '../../../../../primitives/tailwind/Button'
import ColorInput from '../../../../../primitives/tailwind/Color'
import LoadingView from '../../../../../primitives/tailwind/LoadingView'
import InputGroup from '../../../input/Group'
import NodeInput from '../../../input/Node'
import NumericInput from '../../../input/Numeric'

export const SceneSettingsEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const sceneSettingsComponent = useComponent(props.entity, SceneSettingsComponent)
  const sceneThumbnailState = getMutableState(SceneThumbnailState)

  const generateColors = () => {
    const url = sceneThumbnailState.thumbnailURL.value ?? sceneSettingsComponent.thumbnailURL.value
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
    <NodeEditor
      {...props}
      name={t('editor:properties.sceneSettings.name')}
      description={t('editor:properties.sceneSettings.description')}
      Icon={SceneSettingsEditor.iconComponent}
      entity={props.entity}
    >
      <InputGroup
        name="Spectate Entity"
        label={t('editor:properties.sceneSettings.lbl-spectate')}
        info={t('editor:properties.sceneSettings.info-spectate')}
      >
        <Checkbox
          checked={useSpectatingEntity.value}
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
          <ImageLink src={sceneThumbnailState.thumbnailURL.value ?? sceneSettingsComponent.thumbnailURL.value} />

          <Button onClick={SceneThumbnailState.createThumbnail} className="mt-2 w-full">
            {t('editor:properties.sceneSettings.generate')}
          </Button>
          {sceneThumbnailState.uploadingThumbnail.value ? (
            <LoadingView spinnerOnly />
          ) : (
            <Button
              onClick={() => {
                SceneThumbnailState.uploadThumbnail(props.entity)
              }}
              disabled={!sceneThumbnailState.thumbnail.value}
              className="mt-2 w-full"
            >
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
          <ImageLink
            src={sceneThumbnailState.loadingScreenURL.value ?? sceneSettingsComponent.loadingScreenURL.value}
          />
          <Button onClick={SceneThumbnailState.createLoadingScreen} className="mt-2 w-full">
            {t('editor:properties.sceneSettings.generate')}
          </Button>
          {sceneThumbnailState.uploadingLoadingScreen.value ? (
            <LoadingView spinnerOnly />
          ) : (
            <Button
              onClick={() => {
                SceneThumbnailState.uploadLoadingScreen(props.entity)
              }}
              disabled={!sceneThumbnailState.loadingScreenImageData.value}
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
            disabled={!sceneThumbnailState.thumbnailURL.value && !sceneSettingsComponent.thumbnailURL.value}
            value={new Color(sceneSettingsComponent.primaryColor.value)}
            onChange={(val) => updateProperty(SceneSettingsComponent, 'primaryColor')('#' + val.getHexString())}
            onRelease={(val) => commitProperty(SceneSettingsComponent, 'primaryColor')('#' + val.getHexString())}
            className="w-full"
          />
          <ColorInput
            disabled={!sceneThumbnailState.thumbnailURL.value && !sceneSettingsComponent.thumbnailURL.value}
            value={new Color(sceneSettingsComponent.backgroundColor.value)}
            onChange={(val) => updateProperty(SceneSettingsComponent, 'backgroundColor')('#' + val.getHexString())}
            onRelease={(val) => commitProperty(SceneSettingsComponent, 'backgroundColor')('#' + val.getHexString())}
            className="w-full"
          />
          <ColorInput
            disabled={!sceneThumbnailState.thumbnailURL.value && !sceneSettingsComponent.thumbnailURL.value}
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
    </NodeEditor>
  )
}

SceneSettingsEditor.iconComponent = RiLandscapeLine
export default SceneSettingsEditor
