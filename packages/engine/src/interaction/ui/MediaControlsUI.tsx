import { createState } from '@hookstate/core'
import React, { useEffect, useState } from 'react'

import { useXRUIState } from '@xrengine/engine/src/xrui/functions/useXRUIState'

import { Pause, PlayArrow } from '@mui/icons-material'

import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { CallbackComponent } from '../../scene/components/CallbackComponent'
import { MediaElementComponent } from '../../scene/components/MediaElementComponent'
import { createXRUI } from '../../xrui/functions/createXRUI'

type Props = {
  playing: boolean
}

export function createMediaControlsView(data: Props, entity: Entity) {
  const MediaControls = () => <MediaControlsView entity={entity} />
  return createXRUI(MediaControls, createMediaControlsState(data))
}

function createMediaControlsState(data: Props) {
  return createState({
    playing: data.playing,
    mouseOver: false
  })
}

type MediaControlsState = ReturnType<typeof createMediaControlsState>

type MediaControlsProps = {
  entity: Entity
}

const MediaControlsView = (props: MediaControlsProps) => {
  const detailState = useXRUIState() as MediaControlsState
  const mediaComponent = getComponent(props.entity, MediaElementComponent)

  useEffect(() => {
    mediaComponent.addEventListener('playing', () => {
      detailState.merge({ playing: true })
    })
    mediaComponent.addEventListener('pause', () => {
      detailState.merge({ playing: false })
    })
  }, [])

  const buttonClick = () => {
    const callback = getComponent(props.entity, CallbackComponent) as any
    detailState.playing.value ? callback?.pause() : callback?.play()
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
        {detailState.playing.value ? <Pause style={{ fill: 'white' }} /> : <PlayArrow style={{ fill: 'white' }} />}
      </button>
    </div>
  )
}
