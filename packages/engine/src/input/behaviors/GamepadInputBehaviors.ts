import { BinaryValue } from "../../common/enums/BinaryValue";
import { applyThreshold } from "../../common/functions/applyThreshold";
import { InputType } from "../enums/InputType";
import { GamepadButtons, Thumbsticks } from "../enums/InputEnums";
import { InputAlias } from "../types/InputAlias";
import { Input } from "../components/Input";
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { Engine } from "../../ecs/classes/Engine";

const inputPerGamepad = 2;
let input: Input;
let gamepads: Gamepad[];
let gamepad: Gamepad;
let inputBase: number;
let x: number;
let y: number;
let prevLeftX: number;
let prevLeftY: number;

let _index: number; // temp var for iterator loops
/**
 * System behavior to handle gamepad input
 * 
 * @param {Entity} entity The entity
 */
export const handleGamepads = () => {
  // Get an immutable reference to input
  if (!Engine.gamepadConnected) return;
  // Get gamepads from the DOM
  gamepads = navigator.getGamepads();

  // Loop over connected gamepads
  for (_index = 0; _index < gamepads.length; _index++) {
    // If there's no gamepad at this index, skip
    if (!gamepads[_index]) return;
    // Hold reference to this gamepad
    gamepad = gamepads[_index];

    // If the gamepad has analog inputs (dpads that aren't up UP/DOWN/L/R but have -1 to 1 values for X and Y)
    if (gamepad.axes) {
      // GamePad 0 Left Stick XY
      if (gamepad.axes.length >= inputPerGamepad) {
        handleGamepadAxis({
          gamepad: gamepad,
          inputIndex: 0,
          mappedInputValue: Thumbsticks.Left
        });
      }

      // GamePad 1 Right Stick XY
      if (gamepad.axes.length >= inputPerGamepad * 2) {
        handleGamepadAxis({
          gamepad,
          inputIndex: 1,
          mappedInputValue: Thumbsticks.Right
        });
      }
    }

    // If the gamepad doesn't have buttons, or the input isn't mapped, return
    if (!gamepad.buttons) return;

    // Otherwise, loop through gamepad buttons
    for (_index = 0; _index < gamepad.buttons.length; _index++) {
      handleGamepadButton({
        gamepad,
        index: _index,
        mappedInputValue: _index
      });
    }
  }
};

/**
 * Gamepad button
 * 
 * @param {Entity} entity The entity
 * @param args is argument object
 */
const handleGamepadButton = (
  args: { gamepad: Gamepad; index: number; mappedInputValue: InputAlias }
) => {
  if (gamepad.buttons[args.index].touched === (Engine.gamepadButtons[args.index] === BinaryValue.ON)) return;
  // Set input data
  input.data.set(gamepadMapping[args.gamepad.mapping || 'standard'][args.index], {
    type: InputType.BUTTON,
    value: gamepad.buttons[args.index].touched ? BinaryValue.ON : BinaryValue.OFF,
    lifecycleState: gamepad.buttons[args.index].touched? LifecycleValue.STARTED : LifecycleValue.ENDED
  });
  Engine.gamepadButtons[args.index] = gamepad.buttons[args.index].touched ? 1 : 0;
};

/**
 * Gamepad axios
 * 
 * @param {Entity} entity The entity
 * @param args is argument object 
 */
export const handleGamepadAxis = (
  args: { gamepad: Gamepad; inputIndex: number; mappedInputValue: InputAlias }
) => {

  inputBase = args.inputIndex * 2;
  const xIndex = inputBase;
  const yIndex = inputBase + 1;

  x = applyThreshold(gamepad.axes[xIndex], Engine.gamepadThreshold);
  y = applyThreshold(gamepad.axes[yIndex], Engine.gamepadThreshold);
  if (args.mappedInputValue === BaseInput.MOVEMENT_PLAYERONE) {
    const tmpX = x;
    x = -y;
    y = -tmpX;
  }

  prevLeftX = Engine.gamepadInput[xIndex];
  prevLeftY = Engine.gamepadInput[yIndex];

  // Axis has changed, so get mutable reference to Input and set data
  if (x !== prevLeftX || y !== prevLeftY) {
    Engine.inputState.set(args.mappedInputValue, {
      type: InputType.TWODIM,
      value: [x, y]
    });

    Engine.gamepadInput[xIndex] = x;
    Engine.gamepadInput[yIndex] = y;
  }
};

/**
 * When a gamepad connects
 * 
 * @param {Entity} entity The entity
 * @param args is argument object 
 */
export const handleGamepadConnected = (args: { event: any }): void => {
  console.log('A gamepad connected:', args.event.gamepad, args.event.gamepad.mapping);

  if (args.event.gamepad.mapping !== 'standard') {
    console.error('Non-standard gamepad mapping detected, it could be handled not properly.');
  }

  Engine.gamepadConnected = true;
  gamepad = args.event.gamepad;

  for (let index = 0; index < gamepad.buttons.length; index++) {
    if (typeof Engine.gamepadButtons[index] === 'undefined') Engine.gamepadButtons[index] = 0;
  }
};

/**
 * When a gamepad disconnects
 * 
 * @param {Entity} entity The entity
 * @param args is argument object 
 */
export const handleGamepadDisconnected = (args: { event: any }): void => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
  console.log('A gamepad disconnected:', args.event.gamepad);

  Engine.gamepadConnected = false;

  if (!input.schema || !Engine.gamepadButtons) return; // Already disconnected?

  for (let index = 0; index < Engine.gamepadButtons.length; index++) {
    if (
      Engine.gamepadButtons[index] === BinaryValue.ON
    ) {
      input.data.set(gamepadMapping[args.event.gamepad.mapping || 'standard'][index], {
        type: InputType.BUTTON,
        value: BinaryValue.OFF
      });
    }
    Engine.gamepadButtons[index] = 0;
  }
};



export const gamepadMapping = {
  //https://w3c.github.io/gamepad/#remapping
  standard: {
    0: GamepadButtons.A,
    1: GamepadButtons.B,
    2: GamepadButtons.X,
    3: GamepadButtons.Y,
    4: GamepadButtons.LBumper,
    5: GamepadButtons.RBumper,
    6: GamepadButtons.LTrigger,
    7: GamepadButtons.RTrigger,
    8: GamepadButtons.Back,
    9: GamepadButtons.Start,
    10: GamepadButtons.LStick,
    11: GamepadButtons.RStick,
    12: GamepadButtons.DPad1,
    13: GamepadButtons.DPad2,
    14: GamepadButtons.DPad3,
    15: GamepadButtons.DPad4
  },
  //https://www.w3.org/TR/webxr-gamepads-module-1/
  'xr-standard': {
    left: {
      buttons: {
        0: GamepadButtons.LTrigger,
        1: GamepadButtons.LBumper,
        2: GamepadButtons.LStick,
        3: GamepadButtons.LStick,
        4: GamepadButtons.X,
        5: GamepadButtons.Y,
      },
      axes: Thumbsticks.Left,
    },
    right: {
      buttons: {
        0: GamepadButtons.RTrigger,
        1: GamepadButtons.RBumper,
        2: GamepadButtons.RStick,
        3: GamepadButtons.RStick,
        4: GamepadButtons.A,
        5: GamepadButtons.B,
      },
      axes: Thumbsticks.Right,
    },
  }
}