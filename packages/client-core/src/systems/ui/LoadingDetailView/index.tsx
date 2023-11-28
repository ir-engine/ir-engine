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

import { createState, useHookstate } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { getMutableState } from '@etherealengine/hyperflux'

import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import ProgressBar from './SimpleProgressBar'
import LoadingDetailViewStyle from './style'

export function createLoaderDetailView() {
  const xrui = createXRUI(
    function Loading() {
      return <LoadingDetailView />
    },
    createState({
      colors: {
        main: '',
        background: '',
        alternate: ''
      }
    })
  )
  return xrui
}

const LoadingDetailView = () => {
  const engineState = useHookstate(getMutableState(EngineState))
  const { t } = useTranslation()

  const activeScene = useHookstate(getMutableState(SceneState).activeScene).value!
  const scenesState = useHookstate(getMutableState(SceneState).scenes)
  const loadingProgress = scenesState.value[activeScene] ? scenesState[activeScene].loadingProgress.value : 0
  const sceneLoaded = loadingProgress === 100

  const loadingDetails = sceneLoaded ? t('common:loader.loadingComplete') : t('common:loader.loadingObjects')

  return (
    <>
      <LoadingDetailViewStyle />
      <div id="loading-container" xr-layer="true">
        {/* <div id="thumbnail">
          <img xr-layer="true" xr-pixel-ratio="1" src={thumbnailUrl} crossOrigin="anonymous" />
        </div> */}
        <div id="loading-ui" xr-layer="true">
          <div id="loading-text" xr-layer="true" xr-pixel-ratio="3">
            {t('common:loader.loading')}
          </div>
          <div id="progress-text" xr-layer="true" xr-pixel-ratio="2" xr-prerasterized="0-9">
            {`${loadingProgress}%`}
          </div>
          <div id="progress-container" xr-layer="true" xr-scalable="true">
            <ProgressBar
              bgColor={'#ffffff'}
              completed={100}
              height="2px"
              baseBgColor="#000000"
              isLabelVisible={false}
            />
          </div>
          <div id="loading-details" xr-layer="true" xr-pixel-ratio="3">
            {loadingDetails}
          </div>
        </div>
      </div>
    </>
  )
}
