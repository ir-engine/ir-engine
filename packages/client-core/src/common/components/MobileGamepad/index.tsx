import { TouchApp } from '@styled-icons/material/TouchApp';
import { EngineEvents } from '@xr3ngine/engine/src/ecs/classes/EngineEvents';
import { GamepadAxis, GamepadButtons } from "@xr3ngine/engine/src/input/enums/InputEnums";
import { ClientInputSystem } from '@xr3ngine/engine/src/input/systems/ClientInputSystem';
import nipplejs from 'nipplejs';
import React, { FunctionComponent, useEffect, useRef } from 'react';
// @ts-ignore
import styles from './MobileGamepad.module.scss';
import { MobileGamepadProps } from './MobileGamepadProps';

export const MobileGamepad: FunctionComponent<MobileGamepadProps> = ({ hovered }: MobileGamepadProps) => {
  const leftContainer = useRef<HTMLDivElement>();

  const triggerButton = (button: GamepadButtons, pressed: boolean): void => {
    const eventType = pressed? "mobilegamepadbuttondown" : "mobilegamepadbuttonup";
    const event = new CustomEvent(eventType, { "detail": { button } });
    document.dispatchEvent(event);
  };

  const buttonsConfig: Array<{ button: GamepadButtons; label: string }> = [
    {
      button: GamepadButtons.A,
      label: "A",
    },
  ];

  const buttons = buttonsConfig.map(((value, index) => {
    return (<div
      key={index}
      className={styles.controllButton + ' ' + styles[`gamepadButton_${value.label}`] + ' ' + (hovered ? styles.availableButton : styles.notAvailableButton)}
      onPointerDown={ (): void => triggerButton(value.button, true) }
      onPointerUp={ (): void => triggerButton(value.button, false) }
    ><TouchApp /></div>);
  }));

  useEffect(() => {
    // mount
    const size = window.innerHeight * 0.15;
    const bottom = window.innerHeight * 0.1;

    const stickLeft = nipplejs.create({
      zone: leftContainer.current,
      mode: 'static',
      position: { left: '40%', bottom: bottom + 'px' },
      color: 'white',      
      size: size,
      dynamicPage: true
    });
    const targetElement = stickLeft[0].ui.el;
    console.log(targetElement)
    targetElement.addEventListener('touchstart', (ev) => {
      EngineEvents.instance.dispatchEvent({ type: ClientInputSystem.EVENTS.ENABLE_INPUT,  mouse: false });
    })
    targetElement.addEventListener('touchend', (ev) => {
      EngineEvents.instance.dispatchEvent({ type: ClientInputSystem.EVENTS.ENABLE_INPUT,  mouse: true });
    })

    stickLeft.on("move", ( e, data) => {
      const event = new CustomEvent(
        "stickmove",
        {
          "detail": {
            stick: GamepadAxis.Left, 
            value: { x : data.vector.y, y: -data.vector.x, angleRad: data.angle.radian },
          }, 
        }
      );
      document.dispatchEvent(event);
    });

    stickLeft.on("end", ( e, data) => {
      const event = new CustomEvent("stickmove", { "detail": { stick: GamepadAxis.Left, value: { x: 0, y: 0, angleRad: 0 } } });
      document.dispatchEvent(event);
    });

    return (): void => {
      // unmount
      stickLeft.destroy();
    };
  }, []);


  return   <>
      <div
        className={styles.stickLeft}
        ref={leftContainer}
       />
      <div className={styles.controlButtonContainer}>
        { buttons }
      </div>
    </> ;
};

export default MobileGamepad;