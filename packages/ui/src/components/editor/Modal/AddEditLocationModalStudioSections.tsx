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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useQuery } from '@ir-engine/ecs'
import { SceneThumbnailState } from '@ir-engine/editor/src/services/SceneThumbnailState'
import { SceneSettingsComponent } from '@ir-engine/engine/src/scene/components/SceneSettingsComponent'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { ImageLink } from '@ir-engine/ui/editor'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'

export default function AddEditLocationModalStudioSections() {
  const { t } = useTranslation()

  const sceneSettingsEntities = useQuery([SceneSettingsComponent])
  const sceneThumbnailState = useHookstate(getMutableState(SceneThumbnailState))

  return (
    <>
      <div>{t('editor:properties.sceneSettings.lbl-thumbnail')}</div>
      <div className="flex flex-col ">
        <div className="flex flex-row justify-around">
          <div>{'Current Thumbnail'}</div>
          <div>{'Previous Thumbnail'}</div>
        </div>
        <div className="flex flex-row justify-evenly">
          <ImageLink src={sceneThumbnailState.thumbnailURL.value ?? ''} variant="md" />
          <ImageLink src={sceneThumbnailState.oldThumbnailURL.value ?? ''} variant="md" />
        </div>
        <div className="flex flex-row gap-2 ">
          <Button onClick={SceneThumbnailState.createThumbnail} className="w-full">
            {t('editor:properties.sceneSettings.generate')}
          </Button>
          <Button
            onClick={() => {
              SceneThumbnailState.uploadThumbnail(sceneSettingsEntities)
            }}
            disabled={!sceneThumbnailState.thumbnail.value}
            className="w-full"
          >
            {t('editor:properties.sceneSettings.save')}
          </Button>
        </div>
      </div>
      <div>{t('editor:properties.sceneSettings.lbl-loading')}</div>
      <div className="flex flex-col">
        <div className="flex flex-row justify-around">
          <div>{'Current Loading Screen'}</div>
          <div>{'Previous Loading Screen'}</div>
        </div>
        <div className="flex flex-row justify-evenly ">
          <ImageLink src={sceneThumbnailState.loadingScreenURL.value ?? ''} variant="md" />
          <ImageLink src={sceneThumbnailState.oldLoadingScreenURL.value ?? ''} variant="md" />
        </div>
        <div className="flex flex-row gap-2">
          <Button onClick={SceneThumbnailState.createLoadingScreen} className="w-full">
            {t('editor:properties.sceneSettings.generate')}
          </Button>
          <Button
            onClick={() => {
              SceneThumbnailState.uploadLoadingScreen(sceneSettingsEntities)
            }}
            disabled={!sceneThumbnailState.loadingScreenImageData.value}
            className="w-full"
          >
            {t('editor:properties.sceneSettings.save')}
          </Button>
        </div>
      </div>
    </>
  )
}
