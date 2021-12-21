import React, { useState, useEffect } from 'react'
import { createState } from '@hookstate/core'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import ProgressBar from './SimpleProgressBar'
import { useLocationState } from '../../social/services/LocationService'
import { useSceneState } from '../../world/services/SceneService'
import getImagePalette from 'image-palette-core'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'

export function createLoaderDetailView(id: string) {
  return createXRUI(CharacterDetailView, createLoaderDetailState(id))
}

function createLoaderDetailState(id: string) {
  return createState({
    id
  })
}

type CharacterDetailState = ReturnType<typeof createLoaderDetailState>

const CharacterDetailView = () => {
  const sceneState = useSceneState()
  const engineState = useEngineState()
  const locationState = useLocationState()

  const [show, setShow] = useState(true)
  const [backgroundColor, setBackgroundColor] = useState('black')
  const [alternativeColor, setAlternativeColor] = useState('red')
  const [color, setColor] = useState('white')
  const [width, setWidth] = useState(4096)
  const [height, setHeight] = useState(4096)
  const [progress, setProgress] = useState('0')
  const [loadingDetails, setLoadingDetails] = useState('loading background assests...')
  const [bgImageSrc, setBgImageSrc] = useState(sceneState?.currentScene?.thumbnailUrl?.value || '')

  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setWidth(width)
      setHeight(height)
    }
    window.addEventListener('resize', onResize, false)
  }, [])

  useEffect(() => {
    if (locationState.currentLocation.value && sceneState.currentScene.value) {
      const thumbnail = sceneState.currentScene.thumbnailUrl.value
      setBgImageSrc(thumbnail)
      const img = new Image()
      img.src = thumbnail
      img.crossOrigin = 'Anonymous'
      img.onload = function () {
        const palette = getImagePalette(img)
        if (palette) {
          setBackgroundColor(palette.backgroundColor)
          setColor(palette.color)
          setAlternativeColor(palette.alternativeColor)
        }
      }
    }
  }, [sceneState.currentScene.value, locationState.currentLocation.value])

  useEffect(() => {
    setProgress(engineState.loadingProgress.value.toString())
    setLoadingDetails(engineState.loadingDetails.value)

    if (engineState.loadingProgress.value === 100) {
      setShow(false)
    }

    console.log('------Loading-----', engineState.loadingProgress.value, engineState.loadingDetails.value)
  }, [engineState.loadingProgress.value])

  return show ? (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        top: 0,
        left: 0,
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      {bgImageSrc != '' && (
        <img
          src={bgImageSrc}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            filter: 'blur(5px)',
            backgroundColor: backgroundColor
          }}
        />
      )}

      <div
        xr-layer="true"
        xr-pixel-ratio="2"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: '2',
          padding: '2px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            fontSize: '30px',
            margin: 'auto',
            textAlign: 'center',
            padding: '2px',
            color: alternativeColor
          }}
        >
          loading
        </div>
        <div
          style={{
            fontSize: '50px',
            margin: 'auto',
            textAlign: 'center',
            padding: '2px',
            color: color
          }}
        >
          {progress}%
        </div>
        <div
          style={{
            margin: 'auto',
            textAlign: 'center',
            padding: '5px',
            width: '200px'
          }}
        >
          <ProgressBar
            bgColor={alternativeColor}
            completed={progress}
            height="1px"
            baseBgColor="#000000"
            isLabelVisible={false}
          />
        </div>
        <div
          style={{
            fontSize: '12px',
            margin: 'auto',
            textAlign: 'center',
            padding: '2px',
            color: color
          }}
        >
          {loadingDetails}
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  )
}
