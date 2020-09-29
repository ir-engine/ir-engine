import React, { CSSProperties, FunctionComponent, useEffect, useRef, useState } from 'react';
import nipplejs from 'nipplejs';
import { Thumbsticks } from '@xr3ngine/engine/src/common/enums/Thumbsticks';
import { GamepadButtons } from "@xr3ngine/engine/src/input/enums/GamepadButtons";
import './style.scss';

export type MobileGamepadProps = {
  hovered ?:boolean | false;
  layout ?: string ;
};

export const MobileGamepad: FunctionComponent<MobileGamepadProps> = ({ hovered,layout}:MobileGamepadProps) => {
  const leftContainer = useRef<HTMLDivElement>();

  const triggerButton = (button: GamepadButtons, pressed: boolean): void => {
    const eventType = pressed? "mobilegamepadbuttondown" : "mobilegamepadbuttonup";
    const event = new CustomEvent(eventType, { "detail": { button } });
    document.dispatchEvent(event);
  };

  const buttonsConfig: Array<{ button: GamepadButtons; label: string; }> = [
    {
      button: GamepadButtons.A,
      label: "A",
    },
    {
      button: GamepadButtons.B,
      label: "B",
    },
    {
      button: GamepadButtons.X,
      label: "X",
    },
    {
      button: GamepadButtons.Y,
      label: "Y",
    },
  ];

  const buttons = buttonsConfig.map(((value, index) => {
    let buttonClassName = "controllButton gamepadButton_"+value.label;
    buttonClassName += value.label === 'Y' && hovered ? ' _available' : value.label === 'A' && layout !== 'default' ? '_not_available' :'';
    return (<div
      key={index}
      className={ buttonClassName }
      onPointerDown={ (): void => triggerButton(value.button, true) }
      onPointerUp={ (): void => triggerButton(value.button, false) }
      onTouchStart={ (): void => triggerButton(value.button, true) }
      onTouchEnd={ (): void => triggerButton(value.button, false) }
    >{ value.label }</div>);
  }));

  useEffect(() => {
    // mount
    const size = window.innerHeight * 0.4;
    const bottom = window.innerHeight * 0.25;

    const stickLeft = nipplejs.create({
      zone: leftContainer.current,
      mode: 'static',
      position: { left: '40%', bottom: bottom + 'px' },
      color: 'green',
      size: size,
      dynamicPage: true
    });

    stickLeft.on("move", ( e, data) => {
      console.log('move left', data.vector);
      const event = new CustomEvent("stickmove", { "detail": { stick: Thumbsticks.Left, value: { x: data.vector.y, y: -data.vector.x } } });
      document.dispatchEvent(event);
    });
    stickLeft.on("end", ( e, data) => {
      const event = new CustomEvent("stickmove", { "detail": { stick: Thumbsticks.Left, value: { x:0, y:0 } } });
      document.dispatchEvent(event);
    });

    return (): void => {
      // unmount
      stickLeft.destroy();
    };
  }, []);

  return (
    <>
      <div
        className='stickLeft'
        ref={leftContainer}
       />
      <div className="controlButtonContainer">
        { buttons }
      </div>
    </>);
};

export default MobileGamepad