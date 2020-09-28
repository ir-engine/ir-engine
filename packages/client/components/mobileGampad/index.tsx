import React, { CSSProperties, FunctionComponent, useEffect, useRef, useState } from 'react';
import nipplejs from 'nipplejs';
import { Thumbsticks } from '@xr3ngine/engine/src/common/enums/Thumbsticks';
import { GamepadButtons } from "@xr3ngine/engine/src/input/enums/GamepadButtons";
import './style.scss';

export const MobileGamepad: FunctionComponent = (props: any) => {
  const leftContainer = useRef<HTMLDivElement>();
  const rightContainer = useRef<HTMLDivElement>();

  const containerStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    width: '50%'
  };
  const leftContainerStyle: CSSProperties = {
    left: 0
  };
  const rightContainerStyle: CSSProperties = {
    right: 0
  };

  const buttonSize = '2.5em';
  const buttonCommonStyle: CSSProperties = {
    position: 'absolute',
    borderRadius: '50%',
    backgroundColor: 'white',
    opacity: 0.75,
    bottom: '0px',
    fontSize: '20px',
    height: buttonSize,
    width: buttonSize,
    textAlign: 'center',
    lineHeight: buttonSize
  };

  const buttonsContainerStyle: CSSProperties = {
    position: 'fixed',
    borderRadius: '50%',
    right: '10%',
    bottom: '60%',
    // backgroundColor: 'white',
    // width: '10px',
    // height: '10px'
  };

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
    return (<div
      key={index}
      className={"controllButton gamepadButton_"+value.label}
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

    const stickRight = nipplejs.create({
      zone: rightContainer.current,
      mode: 'static',
      position: { right: '20%', bottom: bottom + 'px' },
      color: 'red',
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