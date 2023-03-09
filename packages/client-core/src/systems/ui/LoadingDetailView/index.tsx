import { createState, State, useHookstate } from '@hookstate/core'
import getImagePalette from 'image-palette-core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'

import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { createTransitionState } from '@etherealengine/engine/src/xrui/functions/createTransitionState'
import { createXRUI, XRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@etherealengine/engine/src/xrui/functions/useXRUIState'

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

function setDefaultPalette(colors) {
  colors.main.set('black')
  colors.background.set('white')
  colors.alternate.set('black')
}
export const themeColors = {
  main: '',
  background: '',
  alternate: ''
}
const LoadingDetailView = (props: { transition: ReturnType<typeof createTransitionState> }) => {
  const uiState = useXRUIState<LoadingUIState>()
  const sceneState = useSceneState()
  const engineState = useEngineState()

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
          <div id="progress-text" xr-layer="true" xr-pixel-ratio="2" xr-prerasterized="0-9">
            {engineState.loadingProgress.value}
          </div>
          <div id="progress-container" xr-layer="true" xr-scalable="true" xr-apply-dom-layout="once">
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
