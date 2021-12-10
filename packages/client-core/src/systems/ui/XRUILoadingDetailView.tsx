import React, { useState, useEffect } from 'react'
import { createState } from '@hookstate/core'
import { useUserState } from '../../user/services/UserService'
import { createXRUI } from '@xrengine/engine/src/xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import ProgressBar from './SimpleProgressBar'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

//???
import { accessEngineState, useEngineState } from '@xrengine/client-core/src/world/services/EngineService'
import { SceneService, useSceneState } from '@xrengine/client-core/src/admin/services/SceneService'
import { useLocationState } from '../../social/services/LocationService'

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
  const [show, setShow] = useState(true)
  const [backgroundColor, setBackgroundColor] = useState('black')
  const [alternativeColor, setAlternativeColor] = useState('red')
  const [color, setColor] = useState('white')
  const [width, setWidth] = useState(4096)
  const [height, setHeight] = useState(4096)
  const [bgImageSrc, SetBgImageSrc] = useState('')

  const sceneState = useSceneState()
  const locationState = useLocationState()
  const objectsToLoad = useEngineState().loadingProgress.value

  const onResize = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    setWidth(width)
    setHeight(height)
  }
  window.addEventListener('resize', onResize, false)

  useEffect(() => {
    SceneService.fetchAdminScenes()
  }, [])

  useEffect(() => {
    if (
      locationState &&
      locationState.currentLocation &&
      sceneState &&
      sceneState.scenes &&
      sceneState.scenes.length > 0
    ) {
      const locationName = locationState.currentLocation.location.sceneId.value
      const filtered = sceneState.scenes.filter((scene) => `${scene.project.value}/${scene.name.value}` == locationName)
      if (filtered.length != 0 && filtered[0].thumbnailUrl) {
        SetBgImageSrc(filtered[0].thumbnailUrl.value)
      }
    }
  }, [sceneState.scenes, locationState.currentLocation])

  useEffect(() => {
    console.log('objectsToLoad: ', objectsToLoad)
  }, [objectsToLoad])

  return (
    <>
      {!show ? (
        <div></div>
      ) : (
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
                fontSize: '60px',
                margin: 'auto',
                textAlign: 'center',
                padding: '2px',
                color: color
              }}
            >
              80%
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
                completed={80}
                bgColor={alternativeColor}
                height="1px"
                baseBgColor="#000000"
                isLabelVisible={false}
              />
            </div>
            <div
              style={{
                fontSize: '15px',
                margin: 'auto',
                textAlign: 'center',
                padding: '2px',
                color: color
              }}
            >
              Loading background assets...
            </div>
          </div>
        </div>
      )}
    </>
  )
}
