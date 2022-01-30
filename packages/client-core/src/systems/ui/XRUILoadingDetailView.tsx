import React, { useEffect, useState } from 'react'
import { useHookstate, createState, State } from '@speigg/hookstate'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import ProgressBar from './SimpleProgressBar'
import { useSceneState } from '../../world/services/SceneService'
import getImagePalette from 'image-palette-core'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

interface LoadingUIState {
  imageWidth: number
  imageHeight: number
}

const sleep = (m) => new Promise((r) => setTimeout(r, m))

export function createLoaderDetailView() {
  let hasSceneColors = false
  const xrui = createXRUI(
    () => (
      <LoadingDetailView
        onStateChange={(state) => {
          hasSceneColors = state.hasSceneColors
        }}
      ></LoadingDetailView>
    ),
    createState({ imageWidth: 1, imageHeight: 1 })
  )
  return {
    ...xrui,
    waitForSceneColors: async () => {
      const container = await xrui.container
      while (!hasSceneColors) await sleep(100)
      await container.updateUntilReady()
    }
  }
}

function setDefaultPalette(colors) {
  colors.main.set('black')
  colors.background.set('white')
  colors.alternate.set('black')
}

const LoadingDetailView = (props: { onStateChange: (state: { hasSceneColors: boolean }) => void }) => {
  const uiState = useXRUIState<LoadingUIState>()
  const sceneState = useSceneState()
  const engineState = useEngineState()
  const thumbnailUrl = sceneState?.currentScene?.thumbnailUrl?.value

  const colors = useHookstate({
    main: '',
    background: '',
    alternate: ''
  })

  useEffect(() => {
    const thumbnail = sceneState?.currentScene?.thumbnailUrl?.value
    const img = new Image()

    if (thumbnail) {
      colors.main.set('')
      colors.background.set('')
      colors.alternate.set('')
      img.crossOrigin = 'Anonymous'
      img.onload = function () {
        uiState.imageWidth.set(img.naturalWidth)
        uiState.imageHeight.set(img.naturalHeight)
        const palette = getImagePalette(img)
        if (palette) {
          colors.main.set(palette.color)
          colors.background.set(palette.backgroundColor)
          colors.alternate.set(palette.alternativeColor)
        } else {
          setDefaultPalette(colors)
        }
      }
      img.src = thumbnail
    } else {
      setDefaultPalette(colors)
    }

    return () => {
      img.onload = null
    }
  }, [sceneState?.currentScene?.thumbnailUrl?.value])

  useEffect(() => {
    const hasScene = !!sceneState.currentScene
    const hasThumbnail = !!sceneState.currentScene?.thumbnailUrl?.value
    const hasColors = !!colors.main.value
    props.onStateChange({
      hasSceneColors: (hasScene && hasThumbnail && hasColors) || (hasScene && !hasThumbnail && hasColors)
    })
  }, [colors, sceneState?.currentScene?.thumbnailUrl?.value])

  // console.log('LOADING STATE', engineState.loadingProgress.value, engineState.sceneLoaded.value)

  return (
    <>
      <style>{`
      #loading-container {
        position: relative;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        font-family: 'Roboto', sans-serif;
      }

      #loading-container img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        filter: blur(5px);
        ${colors.background.value ? 'backgroundColor: ' + colors.background.value : ''};
      }

      #loading-ui {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        padding: 2px;
        text-align: center;
      }

      #loading-text {
        font-size: 30px;
        margin: auto;
        text-align: center;
        padding: 2px;
        color: ${colors.alternate.value};
      }
      
      #progress-text {
        font-size: 50px;
        margin: auto;
        textAlign: center;
        padding: 2px;
        color: ${colors.main.value};
      }

      #progress-container {
        margin: auto;
        textAlign: center;
        padding: 5px;
        width: 200px;
      }
      
      #loading-details {
        fontSize: 12px;
        margin: auto;
        textAlign: center;
        padding: 2px;
        color: ${colors.main.value};
      }
      
    `}</style>
      <div id="loading-container" xr-layer="true">
        <div id="thumbnail">
          <img xr-layer="true" xr-pixel-ratio="2" src={thumbnailUrl} />
        </div>
        <div id="loading-ui" xr-layer="true">
          <div id="loading-text" xr-layer="true" xr-pixel-ratio="3">
            loading
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
            {engineState.loadingDetails.value}
          </div>
        </div>
      </div>
    </>
  )
}
