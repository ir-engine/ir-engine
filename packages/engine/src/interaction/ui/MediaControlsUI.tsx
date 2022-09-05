import React from 'react'

import { useHookstate } from '@xrengine/hyperflux'

import { Pause, PlayArrow } from '@mui/icons-material'

import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { MediaComponent, MediaElementComponent } from '../../scene/components/MediaComponent'
import { createXRUI } from '../../xrui/functions/createXRUI'

export function createMediaControlsView(entity: Entity) {
  const MediaControls = () => <MediaControlsView entity={entity} />
  return createXRUI(MediaControls)
}

type MediaControlsProps = {
  entity: Entity
}

const MediaControlsView = (props: MediaControlsProps) => {
  const mediaComponent = useHookstate(getComponent(props.entity, MediaComponent))

  const buttonClick = () => {
    const mediaElement = getComponent(props.entity, MediaElementComponent)
    if (!mediaElement) return
    mediaElement.element.paused ? mediaElement.element.play() : mediaElement.element.pause()
  }

  return (
    <div
      id="container"
      style={{
        width: '100px',
        height: '100px',
        display: 'flex',
        padding: '150px'
      }}
    >
      <button
        xr-layer="true"
        id="button"
        style={{
          fontFamily: "'Roboto', sans-serif",
          border: '10px solid grey',
          boxShadow: '#fff2 0 0 30px',
          color: 'lighgrey',
          fontSize: '25px',
          width: '100px',
          height: '100px',
          margin: 'auto auto',
          transform: 'translateZ(0.01px)'
        }}
        onClick={buttonClick}
      >
        <style>
          {`
        button {
          background-color: #000000dd;
        }
        button:hover {
            background-color: grey;
        }`}
        </style>
        {mediaComponent.paused.value ? <PlayArrow style={{ fill: 'white' }} /> : <Pause style={{ fill: 'white' }} />}
      </button>
    </div>
  )
}
