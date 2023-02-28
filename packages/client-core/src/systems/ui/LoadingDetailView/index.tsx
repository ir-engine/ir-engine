import { createState, State, useHookstate } from '@hookstate/core'
import getImagePalette from 'image-palette-core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'

import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { createTransitionState } from '@xrengine/engine/src/xrui/functions/createTransitionState'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import { getAppTheme } from '../../../common/services/AppThemeState'
import { useSceneState } from '../../../world/services/SceneService'
import ProgressBar from './SimpleProgressBar'
import LoadingDetailViewStyle from './style'

interface LoadingUIState {
  imageWidth: number
  imageHeight: number
}

export function createLoaderDetailView(transition: ReturnType<typeof createTransitionState>) {
  const xrui = createXRUI(function Loading() {
    return <LoadingDetailView transition={transition} />
  }, createState({ imageWidth: 1, imageHeight: 1 }))
  return xrui
}

const col = new Color()

export const themeColors = {
  main: '',
  background: '',
  alternate: ''
}

const LoadingDetailView = (props: { transition: ReturnType<typeof createTransitionState> }) => {
  const uiState = useXRUIState<LoadingUIState>()
  const sceneState = useSceneState()
  const engineState = useEngineState()

  const theme = getAppTheme()
  const defaultColorHex = theme ? theme.textColor : '#000'

  const { t } = useTranslation()

  useEffect(() => {
    const thumbnailUrl = sceneState.currentScene.ornull?.thumbnailUrl.value
    const img = new Image()

    if (thumbnailUrl) {
      img.crossOrigin = 'anonymous'
      img.onload = function () {
        uiState.imageWidth.set(img.naturalWidth)
        uiState.imageHeight.set(img.naturalHeight)
        const palette = getImagePalette(img)
        if (palette) {
          themeColors.main = palette.color
          themeColors.background = palette.backgroundColor
          col.set(themeColors.background)
          themeColors.alternate = palette.alternativeColor
        }
      }
      img.src = thumbnailUrl
    }

    return () => {
      img.onload = null
    }
  }, [sceneState.currentScene.ornull?.thumbnailUrl])

  const sceneLoaded = engineState.sceneLoaded.value
  const joinedWorld = engineState.joinedWorld.value
  const loadingDetails = !sceneLoaded
    ? t('common:loader.loadingObjects')
    : !joinedWorld
    ? t('common:loader.joiningWorld')
    : t('common:loader.loadingComplete')

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
          <div id="progress-text" xr-layer="true" xr-pixel-ratio="3">
            {engineState.loadingProgress.value}%
          </div>
          <div id="progress-container" xr-layer="true" xr-scalable="true">
            <ProgressBar bgColor={'#fff'} completed={100} height="2px" baseBgColor="#000000" isLabelVisible={false} />
          </div>
          <div id="loading-details" xr-layer="true" xr-pixel-ratio="3">
            {loadingDetails}
          </div>
        </div>
      </div>
    </>
  )
}
