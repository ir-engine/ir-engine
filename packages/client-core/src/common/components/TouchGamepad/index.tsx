import { TouchApp } from '@styled-icons/material/TouchApp'
import { GamepadAxis, GamepadButtons } from '@xrengine/engine/src/input/enums/InputEnums'
import { addClientInputListeners } from '@xrengine/engine/src/input/functions/clientInputListeners'
import { handleTouch, handleTouchMove } from '@xrengine/engine/src/input/schema/ClientInputSchema'
import { enableInput } from '@xrengine/engine/src/input/systems/ClientInputSystem'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'
import nipplejs from 'nipplejs'
import React, { FunctionComponent, useEffect, useRef } from 'react'
import styles from './TouchGamepad.module.scss'
import { TouchGamepadProps } from './TouchGamepadProps'

export const TouchGamepad: FunctionComponent<TouchGamepadProps> = () => {
  const leftContainer = useRef<HTMLDivElement>()

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
        <TouchApp />
      </div>
    )
  })

  useEffect(() => {
    // mount
    const size = window.innerHeight * 0.15
    const bottom = window.innerHeight * 0.1

    const stickLeft = nipplejs.create({
      zone: leftContainer.current,
      mode: 'static',
      position: { left: '40%', bottom: bottom + 'px' },
      color: 'white',
      size: size,
      dynamicPage: true
    })
    const targetElement = stickLeft[0].ui.el
    targetElement.addEventListener('touchstart', (ev) => {
      enableInput({ mouse: false })
    })
    targetElement.addEventListener('touchend', (ev) => {
      enableInput({ mouse: true })
    })

    stickLeft.on('move', (e, data) => {
      const canvasElement = EngineRenderer.instance?.canvas
      if (!canvasElement) return
      if (canvasElement.addEventListener) {
        addClientInputListeners(canvasElement)
      } else {
        if ((canvasElement as any).attachEvent) {
          ;(canvasElement as any)
            .attachEvent('touchstart', function (e) {
              handleTouch(e)
              handleTouchMove(e)
            })(canvasElement as any)
            .attachEvent('touchend', handleTouch)
            .attachEvent('touchcancel', handleTouch)
            .attachEvent('touchmove', handleTouchMove)
        }
      }

      const event = new CustomEvent('touchstickmove', {
        detail: {
          stick: GamepadAxis.Left,
          value: { x: data.vector.y, y: -data.vector.x, angleRad: data.angle.radian }
        }
      })
      document.dispatchEvent(event)
    })

    stickLeft.on('end', (e, data) => {
      const event = new CustomEvent('touchstickmove', {
        detail: { stick: GamepadAxis.Left, value: { x: 0, y: 0, angleRad: 0 } }
      })
      document.dispatchEvent(event)
    })

    return (): void => {
      // unmount
      stickLeft.destroy()
    }
  }, [])

  return (
    <>
      <div className={styles.stickLeft} ref={leftContainer} />
      <div className={styles.controlButtonContainer}>{buttons}</div>
    </>
  )
}

export default TouchGamepad
