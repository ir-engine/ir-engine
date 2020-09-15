import React, { CSSProperties, FunctionComponent, useEffect, useRef, useState } from 'react';
import nipplejs from 'nipplejs';
import { Thumbsticks } from '@xr3ngine/engine/src/common/enums/Thumbsticks';
import { GamepadButtons } from "@xr3ngine/engine/src/input/enums/GamepadButtons";

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

  const buttonStyle: CSSProperties = {
    position: 'fixed',
    borderRadius: '50%',
    backgroundColor: 'gray',
    opacity: 0.75,
    bottom: '220px',
    height: '30px',
    width: '30px',
  };
  const buttonAStyle: CSSProperties = {
    right: '100px'
  };
  const buttonBStyle: CSSProperties = {
    right: '50px'
  };

  const triggerButton = (button: GamepadButtons, pressed: boolean): void => {
    const eventType = pressed? "mobilegamepadbuttondown" : "mobilegamepadbuttonup";
    const event = new CustomEvent(eventType, { "detail": { button } });
    document.dispatchEvent(event);
  };

  useEffect(() => {
    // mount

    const stickLeft = nipplejs.create({
      zone: leftContainer.current,
      mode: 'static',
      position: { left: '20%', bottom: '110px' },
      color: 'green',
      size: 200,
      dynamicPage: true
    });

    const stickRight = nipplejs.create({
      zone: rightContainer.current,
      mode: 'static',
      position: { right: '20%', bottom: '110px' },
      color: 'red',
      size: 200,
      dynamicPage: true
    });

    stickLeft.on("move", ( e, data) => {
      const event = new CustomEvent("stickmove", { "detail": { stick: Thumbsticks.Left, value: { x: data.vector.y, y: -data.vector.x } } });
      document.dispatchEvent(event);
    });
    stickLeft.on("end", ( e, data) => {
      const event = new CustomEvent("stickmove", { "detail": { stick: Thumbsticks.Left, value: { x:0, y:0 } } });
      document.dispatchEvent(event);
    });

    stickRight.on("move", (e, data) => {
      const event = new CustomEvent("stickmove", { "detail": { stick: Thumbsticks.Right, value: { x: data.vector.x * 10, y: data.vector.y * 10 } } });
      document.dispatchEvent(event);
    });
    stickRight.on("end", ( e, data) => {
      const event = new CustomEvent("stickmove", { "detail": { stick: Thumbsticks.Right, value: { x:0, y:0 } } });
      document.dispatchEvent(event);
    });

    // TODO: buttons

    return (): void => {
      // unmount
      stickLeft.destroy();
      stickRight.destroy();
    };
  }, []);

  return (
    <>
      <div
        style={{ ...containerStyle, ...leftContainerStyle }}
        ref={leftContainer}
       />
      <div
        style={{ ...containerStyle, ...rightContainerStyle }}
        ref={rightContainer}
      />
      <div
        style={{ ...buttonStyle, ...buttonAStyle }}
        onPointerDown={ () => triggerButton(GamepadButtons.A, true) }
        onPointerUp={ () => triggerButton(GamepadButtons.A, false) }
      >A</div>
      <div
        style={{ ...buttonStyle, ...buttonBStyle }}
        onPointerDown={ () => triggerButton(GamepadButtons.B, true) }
        onPointerUp={ () => triggerButton(GamepadButtons.B, false) }
      >B</div>
    </>);
};

export default MobileGamepad