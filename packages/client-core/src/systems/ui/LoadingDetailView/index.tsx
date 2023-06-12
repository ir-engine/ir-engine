import { createState, useHookstate } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@etherealengine/engine/src/xrui/functions/useXRUIState'
import { getMutableState } from '@etherealengine/hyperflux'

import ProgressBar from './SimpleProgressBar'
import LoadingDetailViewStyle from './style'

interface LoadingUIState {
  imageWidth: number
  imageHeight: number
  colors: {
    main: string
    background: string
    alternate: string
  }
}

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
  const uiState = useXRUIState<LoadingUIState>()
  const engineState = useHookstate(getMutableState(EngineState))
  const { t } = useTranslation()
  const colors = uiState.colors

  const sceneLoaded = engineState.sceneLoaded.value
  const joinedWorld = engineState.joinedWorld.value
  const loadingDetails = !sceneLoaded
    ? t('common:loader.loadingObjects')
    : !joinedWorld
    ? t('common:loader.joiningWorld')
    : t('common:loader.loadingComplete')

  return (
    <>
      <LoadingDetailViewStyle colors={colors} />
      <div id="loading-container" xr-layer="true">
        {/* <div id="thumbnail">
          <img xr-layer="true" xr-pixel-ratio="1" src={thumbnailUrl} crossOrigin="anonymous" />
        </div> */}
        <div id="loading-ui" xr-layer="true">
          <div id="loading-text" xr-layer="true" xr-pixel-ratio="3">
            {t('common:loader.loading')}
          </div>
          <div id="progress-text" xr-layer="true" xr-pixel-ratio="3">
            {engineState.loadingProgress.value}%
          </div>
          <div id="progress-container" xr-layer="true">
            <ProgressBar
              bgColor={colors.alternate.value}
              completed={engineState.loadingProgress.value}
              height="1px"
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
