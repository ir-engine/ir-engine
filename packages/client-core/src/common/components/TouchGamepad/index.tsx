import { useHookstate, useState } from '@hookstate/core'
import React, { FunctionComponent, useEffect } from 'react'
import { Joystick } from 'react-joystick-component'

import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { GamepadAxis, GamepadButtons } from '@xrengine/engine/src/input/enums/InputEnums'
import { InteractableComponent } from '@xrengine/engine/src/interaction/components/InteractableComponent'
import { InteractState } from '@xrengine/engine/src/interaction/systems/InteractiveSystem'
import { getState } from '@xrengine/hyperflux'

import TouchAppIcon from '@mui/icons-material/TouchApp'

import styles from './index.module.scss'
import { TouchGamepadProps } from './TouchGamepadProps'

export const TouchGamepad: FunctionComponent<TouchGamepadProps> = () => {
  const triggerButton = (button: GamepadButtons, pressed: boolean): void => {
    const eventType = pressed ? 'touchgamepadbuttondown' : 'touchgamepadbuttonup'
    const event = new CustomEvent(eventType, { detail: { button } })
    document.dispatchEvent(event)
  }

  const interactState = useHookstate(getState(InteractState))
  const availableInteractable = interactState.available.value?.[0]

  const buttonsConfig: Array<{ button: GamepadButtons; label: string }> = [
    {
      button: GamepadButtons.A,
      label: 'A'
    }
  ]

  const buttons = buttonsConfig.map((value, index) => {
    return (
      <div
        key={index}
        className={
          styles.controllButton + ' ' + styles[`gamepadButton_${value.label}`] + ' ' + styles.availableButton
          // (hovered ? styles.availableButton : styles.notAvailableButton)
        }
        onPointerDown={(): void => triggerButton(value.button, true)}
        onPointerUp={(): void => triggerButton(value.button, false)}
      >
        <TouchAppIcon />
      </div>
    )
  })

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
        stick: GamepadAxis.Left,
        value: { x: normalizeValues(-e.y), y: normalizeValues(e.x), angleRad: 0 }
      }
    })
    document.dispatchEvent(event)
  }

  const handleStop = () => {
    const event = new CustomEvent('touchstickmove', {
      detail: { stick: GamepadAxis.Left, value: { x: 0, y: 0, angleRad: 0 } }
    })
    document.dispatchEvent(event)
  }

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

export default TouchGamepad
