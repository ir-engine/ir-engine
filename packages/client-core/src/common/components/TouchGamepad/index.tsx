import { useHookstate } from '@hookstate/core'
import React from 'react'
import { Joystick } from 'react-joystick-component'

import { isTouchAvailable } from '@etherealengine/engine/src/common/functions/DetectFeatures'
import { ButtonTypes } from '@etherealengine/engine/src/input/InputState'
import { InteractState } from '@etherealengine/engine/src/interaction/systems/InteractiveSystem'
import { useIsHeadset } from '@etherealengine/engine/src/xr/XRState'
import { getState } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/Icon'

import { AppState } from '../../services/AppService'
import styles from './index.module.scss'

const triggerButton = (button: ButtonTypes, pressed: boolean): void => {
  const eventType = pressed ? 'touchgamepadbuttondown' : 'touchgamepadbuttonup'
  const event = new CustomEvent(eventType, { detail: { button } })
  document.dispatchEvent(event)
}

const normalizeValues = (val) => {
  const a = 1
  const b = -1
  const maxVal = 50
  const minVal = -50

  const newValue = (b - a) * ((val - minVal) / (maxVal - minVal)) + a

  return newValue
}

const handleMove = (e) => {
  const event = new CustomEvent('touchstickmove', {
    detail: {
      stick: 'LeftStick',
      value: { x: normalizeValues(-e.x), y: normalizeValues(e.y), angleRad: 0 }
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

const buttonsConfig: Array<{ button: ButtonTypes; label: string }> = [
  {
    button: 'ButtonA',
    label: 'A'
  }
]

export const TouchGamepad = () => {
  const interactState = useHookstate(getState(InteractState))
  const availableInteractable = interactState.available.value?.[0]
  const appState = useHookstate(getState(AppState))
  const isHeadset = useIsHeadset()

  if (!isTouchAvailable || isHeadset || !appState.showTouchPad.value) return <></>

  const buttons = buttonsConfig.map((value, index) => {
    return (
      <div
        key={index}
        className={styles.controllButton + ' ' + styles[`gamepadButton_${value.label}`] + ' ' + styles.availableButton}
        onPointerDown={(): void => triggerButton(value.button, true)}
        onPointerUp={(): void => triggerButton(value.button, false)}
      >
        <Icon type="TouchApp" />
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
