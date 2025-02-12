/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import Pause from '@mui/icons-material/Pause'
import PlayArrow from '@mui/icons-material/PlayArrow'
import React from 'react'

import { getMutableComponent, getOptionalComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { MediaComponent, MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { createXRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import { useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { XRUIComponent } from '@ir-engine/spatial/src/xrui/components/XRUIComponent'

export function createMediaControlsView(entity: Entity) {
  const MediaControls = () => <MediaControlsView entity={entity} />
  const videoTransform = getOptionalComponent(entity, TransformComponent)
  const videoComponent = getOptionalComponent(entity, VideoComponent)
  const scaleX = (videoComponent?.size.x ?? 1) * (videoTransform?.scale.x ?? 1)
  const scaleY = (videoComponent?.size.y ?? 1) * (videoTransform?.scale.y ?? 1)

  const controlsUIScale = Math.min(scaleX, scaleY)

  const xrUI = createXRUI(MediaControls, null, { interactable: false })
  const xrUITransform = getOptionalComponent(xrUI.entity, XRUIComponent)
  xrUITransform?.scale.set(controlsUIScale, controlsUIScale, 1)

  return xrUI
}

type MediaControlsProps = {
  entity: Entity
}

const MediaControlsView = (props: MediaControlsProps) => {
  const mediaComponent = useHookstate(getMutableComponent(props.entity, MediaComponent))
  const mediaStyles = { fill: 'white', width: `100%`, height: `100%` }
  const buttonClick = () => {
    //early out if the mediaElement is null
    if (!hasComponent(props.entity, MediaElementComponent)) return

    const isPaused = mediaComponent.paused.value
    mediaComponent.paused.set(!isPaused)
  }

  /** @todo does not currently support tailwind css */
  return (
    <div
      xr-layer="true"
      id="container"
      style={{
        width: `1000px`,
        height: `1000px`,
        display: 'flex',
        alignItems: 'center',
        justifyItems: 'center',
        justifyContent: 'center',
        flex: 'auto'
      }}
    >
      <button
        xr-layer="true"
        id="button"
        style={{
          fontFamily: "'Roboto', sans-serif",
          border: '10px solid grey',
          boxShadow: '#fff2 0 0 30px',
          color: 'lightgrey',
          fontSize: '25px',
          width: '10%',
          height: '10%',
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

        {mediaComponent.paused.value && <PlayArrow style={mediaStyles} />}
        {!mediaComponent.paused.value && <Pause style={mediaStyles} />}
      </button>
    </div>
  )
}
