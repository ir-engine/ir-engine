import TouchAppIcon from '@mui/icons-material/TouchApp'
import { GamepadAxis, GamepadButtons } from '@xrengine/engine/src/input/enums/InputEnums'
import React, { FunctionComponent } from 'react'
import { Joystick } from 'react-joystick-component'
import styles from './TouchGamepad.module.scss'
import { TouchGamepadProps } from './TouchGamepadProps'

export const TouchGamepad: FunctionComponent<TouchGamepadProps> = () => {
  const triggerButton = (button: GamepadButtons, pressed: boolean): void => {
    const eventType = pressed ? 'touchgamepadbuttondown' : 'touchgamepadbuttonup'
    const event = new CustomEvent(eventType, { detail: { button } })
    document.dispatchEvent(event)
  }

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

  const handleMove = (e) => {
    console.log(e)
    const event = new CustomEvent('touchstickmove', {
      detail: {
        stick: GamepadAxis.Left,
        value: { x: e.y, y: -e.x, angleRad: 0 }
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
          throttle={500}
          move={handleMove}
          stop={handleStop}
          minDistance={0.01}
          baseColor="rgba(255, 255, 255, 0.5)"
          stickColor="rgba(255, 255, 255, 0.8)"
        />
      </div>
      <div className={styles.controlButtonContainer}>{buttons}</div>
    </>
  )
}

export default TouchGamepad
