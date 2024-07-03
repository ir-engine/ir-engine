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

import React, { useEffect } from 'react'
import { Joystick } from 'react-joystick-component'

import { InteractableState } from '@etherealengine/engine/src/interaction/functions/interactableFunctions'
import { getMutableState, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { isTouchAvailable } from '@etherealengine/spatial/src/common/functions/DetectFeatures'
import { AnyButton, XRStandardGamepadButton } from '@etherealengine/spatial/src/input/state/ButtonState'
import { XRControlsState, isMobileXRHeadset } from '@etherealengine/spatial/src/xr/XRState'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { AppState } from '../../services/AppService'
import styles from './index.module.scss'

const triggerButton = (button: AnyButton, pressed: boolean): void => {
  const eventType = pressed ? 'touchgamepadbuttondown' : 'touchgamepadbuttonup'
  const event = new CustomEvent(eventType)
  document.dispatchEvent(event)
}

const handleMove = (e) => {
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

  const isMovementControlsEnabled = useHookstate(getMutableState(XRControlsState).isMovementControlsEnabled)

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
    return <></>

  const buttons = buttonsConfig.map((value, index) => {
    return (
      <div
        key={index}
        className={styles.controllButton + ' ' + styles[`gamepadButton_${value.label}`] + ' ' + styles.availableButton}
        onPointerDown={(): void => triggerButton(value.button, true)}
        onPointerUp={(): void => triggerButton(value.button, false)}
      >
        {value.label}
      </div>
    )
  })

  return (
    <>
      <div className={styles.stickLeft}>
        <Joystick
          size={100}
          throttle={100}
          minDistance={40}
          move={handleMove}
          stop={handleStop}
          baseColor="rgba(255, 255, 255, 0.5)"
          stickColor="rgba(255, 255, 255, 0.8)"
        />
      </div>
      {availableInteractable && <div className={styles.controlButtonContainer}>{buttons}</div>}
    </>
  )
}
