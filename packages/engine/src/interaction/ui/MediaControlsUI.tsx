import React from 'react'
import { createState } from '@hookstate/core'
import { createXRUI } from '../../xrui/functions/createXRUI'
import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'
import { PlayArrow, Pause } from '@mui/icons-material'
import { MediaComponent, MediaComponentType } from '../../scene/components/MediaComponent'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'

export function createMediaControlsView(data: MediaComponentType, entity: Entity) {
  return createXRUI(() => <MediaControlsView entity={entity} />, createInteractiveModalState(data))
}

function createInteractiveModalState(data: MediaComponentType) {
  return createState({
    playing: data.playing,
    el: data.el!
  })
}

type InteractiveDetailState = ReturnType<typeof createInteractiveModalState>

const MediaControlsView = ({ entity }) => {
  const detailState = useXRUIState() as InteractiveDetailState
  const mediaComponent = getComponent(entity, MediaComponent)

  const buttonClick = () => {
    detailState.playing.value ? mediaComponent.el?.pause() : mediaComponent.el?.play()
  }

  return (
    <>
      <button
        xr-layer="true"
        style={{
          fontFamily: "'Roboto', sans-serif",
          border: '10px solid white',
          boxShadow: '#fff2 0 0 30px',
          backgroundColor: '#000000dd',
          color: 'white',
          fontSize: '25px',
          position: 'absolute',
          width: '100px',
          height: '100px'
        }}
        onClick={buttonClick}
      >
        {detailState.playing.value ? <Pause style={{ fill: 'white' }} /> : <PlayArrow style={{ fill: 'white' }} />}
      </button>
      <style>
        {`button:hover {
            background-color: darkgrey;
        }`}
      </style>
    </>
  )
}
