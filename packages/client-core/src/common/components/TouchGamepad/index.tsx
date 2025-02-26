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

import React, { useEffect } from 'react'
import { Joystick } from 'react-joystick-component'

import { InteractableState } from '@ir-engine/engine/src/interaction/functions/interactableFunctions'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { isTouchAvailable } from '@ir-engine/spatial/src/common/functions/DetectFeatures'
import { AnyButton, XRStandardGamepadButton } from '@ir-engine/spatial/src/input/state/ButtonState'
import { XRState, isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import Icon from '@ir-engine/ui/src/primitives/mui/Icon'
import { IJoystickUpdateEvent } from 'react-joystick-component/build/lib/Joystick'
import { AppState } from '../../services/AppService'
import BasepadImage from './basepad.svg'
import StickypadImage from './stickypad.svg'

const triggerButton = (button: AnyButton, pressed: boolean): void => {
  const eventType = pressed ? 'touchgamepadbuttondown' : 'touchgamepadbuttonup'
  const event = new CustomEvent(eventType)
  document.dispatchEvent(event)
}

const handleMove = (e: IJoystickUpdateEvent) => {
  if (!e.x || !e.y) return

  const event = new CustomEvent('touchstickmove', {
    detail: {
      stick: 'LeftStick',
      value: { x: e.x, y: -e.y, angleRad: 0 }
    }
  })

  document.dispatchEvent(event)
}

const handleStop = () => {
  const event = new CustomEvent('touchstickmove', {
    detail: { stick: 'LeftStick', value: { x: 0, y: 0, angleRad: 0 } }
  })
  document.dispatchEvent(event)
}

const buttonsConfig: Array<{ button: AnyButton; label: React.ReactElement }> = [
  {
    button: XRStandardGamepadButton.XRStandardGamepadTrigger,
    label: <Icon type="TouchApp" />
  }
]

export const TouchGamepad = () => {
  const interactableState = useMutableState(InteractableState)
  const availableInteractable = interactableState.available.value?.[0]
  const appState = useMutableState(AppState)

  const isMovementControlsEnabled = XRState.useMovementControlsEnabled()

  const hasGamepad = useHookstate(false)

  useEffect(() => {
    const getGamepads = () => {
      hasGamepad.set(!!navigator.getGamepads().filter(Boolean).length)
    }
    getGamepads()
    window.addEventListener('gamepadconnected', getGamepads)
    window.addEventListener('gamepaddisconnected', getGamepads)
    return () => {
      window.removeEventListener('gamepadconnected', getGamepads)
      window.removeEventListener('gamepaddisconnected', getGamepads)
    }
  }, [])

  if (
    !isMovementControlsEnabled ||
    !isTouchAvailable ||
    isMobileXRHeadset ||
    !appState.showTouchPad.value ||
    hasGamepad.value
  )
    return null

  const buttons = buttonsConfig.map((value, index) => (
    <div
      key={index}
      className="bg-[rgb(255,255,255, 0.4)] bottom-5 h-[3em] w-[3em] border border-white text-center text-xl shadow-[0_0_10px_rgba(255,255,0,1)]"
      onPointerDown={(): void => triggerButton(value.button, true)}
      onPointerUp={(): void => triggerButton(value.button, false)}
    >
      {value.label}
    </div>
  ))

  return (
    <>
      <div className="pointer-events-auto fixed bottom-[15%] left-[15%] select-none [&>div]:m-auto">
        <Joystick
          baseImage={StickypadImage}
          stickImage={BasepadImage}
          size={27}
          stickSize={80}
          throttle={100}
          minDistance={40}
          move={handleMove}
          stop={handleStop}
          baseColor="rgba(255, 255, 255, 0.5)"
          stickColor="rgba(255, 255, 255, 0.8)"
        />
      </div>
      {availableInteractable && (
        <div className="fixed bottom-[10px] right-[150px] select-none rounded-[50%] leading-[4em]">{buttons}</div>
      )}
    </>
  )
}
