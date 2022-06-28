import { createState, State, useHookstate } from '@speigg/hookstate'
import getImagePalette from 'image-palette-core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Color } from 'three'

import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { createXRUI, XRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import { useSceneState } from '../../../world/services/SceneService'
import ProgressBar from './SimpleProgressBar'
import LoadingDetailViewStyle from './style'

interface LoadingUIState {
  imageWidth: number
  imageHeight: number
}

export async function createLoaderDetailView() {
  let hasSceneColors = false
  const xrui = await new Promise<XRUI<State<LoadingUIState>>>((resolve) => {
    const xrui = createXRUI(function Loading() {
      return (
        <LoadingDetailView
          onStateChange={(state) => {
            hasSceneColors = state.hasSceneColors
          }}
          colorsLoadedCallback={() => resolve(xrui)}
        />
      )
    }, createState({ imageWidth: 1, imageHeight: 1 }))
  })
  const container = await xrui.container
  await container.updateUntilReady()
  return xrui
}

const col = new Color()

function setDefaultPalette(colors) {
  colors.main.set('black')
  colors.background.set('white')
  colors.alternate.set('black')
}

const LoadingDetailView = (props: {
  colorsLoadedCallback
  onStateChange: (state: { hasSceneColors: boolean }) => void
}) => {
  const uiState = useXRUIState<LoadingUIState>()
  const sceneState = useSceneState()
  const engineState = useEngineState()
  const { t } = useTranslation()
  const colors = useHookstate({
    main: '',
    background: '',
    alternate: ''
  })

  useEffect(() => {
    const thumbnailUrl = sceneState.currentScene.ornull?.thumbnailUrl.value
    const img = new Image()

    if (thumbnailUrl) {
      colors.main.set('')
      colors.background.set('')
      colors.alternate.set('')
      img.crossOrigin = 'anonymous'
      img.onload = function () {
        uiState.imageWidth.set(img.naturalWidth)
        uiState.imageHeight.set(img.naturalHeight)
        const palette = getImagePalette(img)
        if (palette) {
          colors.main.set(palette.color)
          colors.background.set(palette.backgroundColor)
          col.set(colors.background.value)
          colors.alternate.set(palette.alternativeColor)
        } else {
          setDefaultPalette(colors)
        }
        props.colorsLoadedCallback()
      }
      img.src = thumbnailUrl
    } else {
      setDefaultPalette(colors)
    }

    return () => {
      img.onload = null
    }
  }, [sceneState.currentScene.ornull?.thumbnailUrl])

  useEffect(() => {
    const hasScene = !!sceneState.currentScene
    const hasThumbnail = !!sceneState.currentScene.ornull?.thumbnailUrl.value
    const hasColors = !!colors.main.value
    props.onStateChange({
      hasSceneColors: (hasScene && hasThumbnail && hasColors) || (hasScene && !hasThumbnail && hasColors)
    })
  }, [colors, sceneState])

  const sceneLoaded = engineState.sceneLoaded.value
  const joinedWorld = engineState.joinedWorld.value
  const loadingDetails = !sceneLoaded
    ? t('common:loader.loadingObjects')
    : !joinedWorld
    ? t('common:loader.joiningWorld')
    : t('common:loader.loadingComplete')

  return (
    <>
      <LoadingDetailViewStyle col={col} colors={colors} />
      <div id="loading-container" xr-layer="true">
        {/* <div id="thumbnail">
          <img xr-layer="true" xr-pixel-ratio="1" src={thumbnailUrl} crossOrigin="anonymous" />
        </div> */}
        <div id="loading-ui" xr-layer="true">
          <div id="loading-text" xr-layer="true" xr-pixel-ratio="3">
            {t('common:loader.loading')}
          </div>
          <div id="progress-text" xr-layer="true" xr-pixel-ratio="8">
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
          <div id="loading-details" xr-layer="true" xr-pixel-ratio="8">
            {loadingDetails}
          </div>
        </div>
      </div>
    </>
  )
}
