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
    right: '100px',
    bottom: '300px',
    // backgroundColor: 'white',
    // width: '10px',
    // height: '10px'
  };

  const triggerButton = (button: GamepadButtons, pressed: boolean): void => {
    const eventType = pressed? "mobilegamepadbuttondown" : "mobilegamepadbuttonup";
    const event = new CustomEvent(eventType, { "detail": { button } });
    document.dispatchEvent(event);
  };

  const buttonsConfig: Array<{ button: GamepadButtons; label: string; style: CSSProperties }> = [
    {
      button: GamepadButtons.A,
      label: "A",
      style: {
        backgroundColor: '#00bb00',
        right: 0,
        top: 0
      }
    },
    {
      button: GamepadButtons.B,
      label: "B",
      style: {
        backgroundColor: '#bb0000',
        right: '-' + buttonSize,
        bottom: 0
      }
    },
    {
      button: GamepadButtons.X,
      label: "X",
      style: {
        backgroundColor: '#0000ff',
        right: buttonSize,
        bottom: 0
      }
    },
    {
      button: GamepadButtons.Y,
      label: "Y",
      style: {
        backgroundColor: '#ffbb00',
        right: 0,
        bottom: buttonSize
      }
    },
  ];



  const buttons = buttonsConfig.map(((value, index) => {
    return (<div
      key={index}
      style={{ ...buttonCommonStyle, ...value.style }}
      onPointerDown={ (): void => triggerButton(value.button, true) }
      onPointerUp={ (): void => triggerButton(value.button, false) }
    >{ value.label }</div>);
  }));

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
      const event = new CustomEvent("stickmove", { "detail": { stick: Thumbsticks.Right, value: { x: data.vector.x * 10, y: -data.vector.y * 10 } } });
      document.dispatchEvent(event);
    });
    stickRight.on("end", ( e, data) => {
      const event = new CustomEvent("stickmove", { "detail": { stick: Thumbsticks.Right, value: { x:0, y:0 } } });
      document.dispatchEvent(event);
    });

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
      <div style={buttonsContainerStyle}>
        { buttons }
      </div>
    </>);
};

export default MobileGamepad