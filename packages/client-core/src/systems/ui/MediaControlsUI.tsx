/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

import { useHookstate } from '@etherealengine/hyperflux'

import Pause from '@mui/icons-material/Pause'
import PlayArrow from '@mui/icons-material/PlayArrow'

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { MediaComponent, MediaElementComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { createXRUI } from '@etherealengine/engine/src/xrui/functions/createXRUI'

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
