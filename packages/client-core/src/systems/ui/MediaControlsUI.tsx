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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'

import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { MediaComponent, MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { createXRUI, XRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import { useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { XRUIComponent } from '@ir-engine/spatial/src/xrui/components/XRUIComponent'
import { PauseCircleLg, PlayLg, VolumeMaxLg, VolumeXLg } from '@ir-engine/ui/src/icons'

export function createMediaControlsView(entity: Entity): XRUI<null> {
  const MediaControls = () => <MediaControlsView entity={entity} />
  const videoTransform = getOptionalComponent(entity, TransformComponent)
  const scaleX = videoTransform?.scale.x ?? 1
  const scaleY = videoTransform?.scale.y ?? 1

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
  const transform = getComponent(props.entity, TransformComponent)
  const widthFactor = transform?.scale.x ?? 1
  const heightFactor = transform?.scale.y ?? 1
  const mediaComponent = useHookstate(getMutableComponent(props.entity, MediaComponent))
  const mediaStyles = { fill: 'white', width: `100%`, height: `100%` }

  const buttonClickPausedToggle = () => {
    //early out if the mediaElement is null
    if (!hasComponent(props.entity, MediaElementComponent)) return

    const isPaused = mediaComponent.paused.value
    mediaComponent.paused.set(!isPaused)
  }

  const buttonClickMuteToggle = () => {
    //early out if the mediaElement is null
    if (!hasComponent(props.entity, MediaElementComponent)) return
    const isMuted = mediaComponent.muted.value
    mediaComponent.muted.set(!isMuted)
  }

  const width = 1000
  const height = 1000

  /** @todo does not currently support tailwind css */
  return (
    <div
      xr-layer="true"
      id="controls_container"
      style={{
        width: `${width * widthFactor}px`,
        height: `${height * heightFactor}px`
      }}
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

      <div
        xr-layer="true"
        id="pauseContainer"
        style={{
          position: `absolute`,
          top: `0px`,
          left: `0px`,
          width: `100%`,
          height: `100%`,
          display: 'flex',
          alignItems: 'center',
          justifyItems: 'center',
          justifyContent: 'center',
          flex: 'auto'
        }}
      >
        <button
          xr-layer="true"
          id="pauseToggleButton"
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
          onClick={buttonClickPausedToggle}
        >
          {mediaComponent.paused.value && <PlayLg style={mediaStyles} />}
          {!mediaComponent.paused.value && <PauseCircleLg style={mediaStyles} />}
        </button>
      </div>

      <div
        xr-layer="true"
        id="muteContainer"
        style={{
          position: `absolute`,
          top: `0px`,
          left: `0px`,
          width: `100%`,
          height: `100%`,
          display: 'flex',
          alignItems: 'end',
          justifyItems: 'end',
          justifyContent: 'end',
          flex: 'auto'
        }}
      >
        <button
          xr-layer="true"
          id="muteToggleButton"
          style={{
            fontFamily: "'Roboto', sans-serif",
            border: '10px solid grey',
            boxShadow: '#fff2 0 0 30px',
            color: 'lightgrey',
            fontSize: '25px',
            width: '10%',
            height: '10%',
            margin: `10%`,
            transform: 'translateZ(0.01px)'
          }}
          onClick={buttonClickMuteToggle}
        >
          {mediaComponent.muted.value && <VolumeXLg style={mediaStyles} />}
          {!mediaComponent.muted.value && <VolumeMaxLg style={mediaStyles} />}
        </button>
      </div>
    </div>
  )
}
