import { useHookstate } from '@hookstate/core'
import React from 'react'
import { Joystick } from 'react-joystick-component'

import { isTouchAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import { isHMD } from '@xrengine/engine/src/common/functions/isMobile'
import { GamepadAxis, GamepadButtons } from '@xrengine/engine/src/input/enums/InputEnums'
import { InteractState } from '@xrengine/engine/src/interaction/systems/InteractiveSystem'
import { getState } from '@xrengine/hyperflux'

import TouchAppIcon from '@mui/icons-material/TouchApp'

import { AppState } from '../../services/AppService'
import styles from './index.module.scss'

const triggerButton = (button: GamepadButtons, pressed: boolean): void => {
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
      stick: GamepadAxis.RThumbstick,
      value: { x: normalizeValues(-e.x), y: normalizeValues(e.y), angleRad: 0 }
    }
  })
  document.dispatchEvent(event)
}

const handleStop = () => {
  const event = new CustomEvent('touchstickmove', {
    detail: { stick: GamepadAxis.RThumbstick, value: { x: 0, y: 0, angleRad: 0 } }
  })
  document.dispatchEvent(event)
}

const buttonsConfig: Array<{ button: GamepadButtons; label: string }> = [
  {
    button: GamepadButtons.A,
    label: 'A'
  }
]

export const TouchGamepad = () => {
  const interactState = useHookstate(getState(InteractState))
  const availableInteractable = interactState.available.value?.[0]
  const appState = useHookstate(getState(AppState))

  if (!isTouchAvailable || isHMD || !appState.showTouchPad.value) return <></>

  const buttons = buttonsConfig.map((value, index) => {
    return (
      <div
        key={index}
        className={styles.controllButton + ' ' + styles[`gamepadButton_${value.label}`] + ' ' + styles.availableButton}
        onPointerDown={(): void => triggerButton(value.button, true)}
        onPointerUp={(): void => triggerButton(value.button, false)}
      >
        <TouchAppIcon />
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
