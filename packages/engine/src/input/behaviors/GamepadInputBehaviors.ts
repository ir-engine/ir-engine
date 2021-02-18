import { BinaryValue } from "../../common/enums/BinaryValue";
import { applyThreshold } from "../../common/functions/applyThreshold";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { InputType } from "../enums/InputType";
import { InputAlias } from "../types/InputAlias";
import { Input } from "../components/Input";
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';
import { Thumbsticks } from "../../common/enums/Thumbsticks";
import { LifecycleValue } from "../../common/enums/LifecycleValue";

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
export const handleGamepads: Behavior = (entity: Entity) => {
  // Get an immutable reference to input
  input = getComponent(entity, Input);
  if (!input?.gamepadConnected) return;
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
      console.log('real handle is on gamepad side');
      if (input.schema.gamepadInputMap?.axes[Thumbsticks.Left] && gamepad.axes.length >= inputPerGamepad) {
        handleGamepadAxis(entity, {
          gamepad: gamepad,
          inputIndex: 0,
          mappedInputValue: input.schema.gamepadInputMap.axes[Thumbsticks.Left]
        });
      }

      // GamePad 1 Right Stick XY
      if (input.schema.gamepadInputMap?.axes[Thumbsticks.Right] && gamepad.axes.length >= inputPerGamepad * 2) {
        handleGamepadAxis(entity, {
          gamepad,
          inputIndex: 1,
          mappedInputValue: input.schema.gamepadInputMap.axes[Thumbsticks.Right]
        });
      }
    }

    // If the gamepad doesn't have buttons, or the input isn't mapped, return
    if (!gamepad.buttons || !input.schema.gamepadInputMap?.buttons) return;

    // Otherwise, loop through gamepad buttons
    for (_index = 0; _index < gamepad.buttons.length; _index++) {
      handleGamepadButton(entity, {
        gamepad,
        index: _index,
        mappedInputValue: input.schema.gamepadInputMap.buttons[_index]
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
const handleGamepadButton: Behavior = (
  entity: Entity,
  args: { gamepad: Gamepad; index: number; mappedInputValue: InputAlias }
) => {
  // Get mutable component reference
  input = getMutableComponent(entity, Input);
  // Make sure button is in the map
  if (
    typeof input.schema.gamepadInputMap.buttons[args.index] === 'undefined' ||
    gamepad.buttons[args.index].touched === (input.gamepadButtons[args.index] === BinaryValue.ON)
  ) { return; }
  // Set input data
  input.data.set(input.schema.gamepadInputMap.buttons[args.index], {
    type: InputType.BUTTON,
    value: gamepad.buttons[args.index].touched ? BinaryValue.ON : BinaryValue.OFF,
    lifecycleState: gamepad.buttons[args.index].touched? LifecycleValue.STARTED : LifecycleValue.ENDED
  });
  input.gamepadButtons[args.index] = gamepad.buttons[args.index].touched ? 1 : 0;
};

/**
 * Gamepad axios
 * 
 * @param {Entity} entity The entity
 * @param args is argument object 
 */
export const handleGamepadAxis: Behavior = (
  entity: Entity,
  args: { gamepad: Gamepad; inputIndex: number; mappedInputValue: InputAlias }
) => {
  // get immutable component reference
  input = getComponent(entity, Input);

  inputBase = args.inputIndex * 2;
  const xIndex = inputBase;
  const yIndex = inputBase + 1;

  x = applyThreshold(gamepad.axes[xIndex], input.gamepadThreshold);
  y = applyThreshold(gamepad.axes[yIndex], input.gamepadThreshold);
  if (args.mappedInputValue === BaseInput.MOVEMENT_PLAYERONE) {
    const tmpX = x;
    x = -y;
    y = -tmpX;
  }

  prevLeftX = input.gamepadInput[xIndex];
  prevLeftY = input.gamepadInput[yIndex];

  // Axis has changed, so get mutable reference to Input and set data
  if (x !== prevLeftX || y !== prevLeftY) {
    getMutableComponent<Input>(entity, Input).data.set(args.mappedInputValue, {
      type: InputType.TWODIM,
      value: [x, y]
    });

    input.gamepadInput[xIndex] = x;
    input.gamepadInput[yIndex] = y;
  }
};

/**
 * When a gamepad connects
 * 
 * @param {Entity} entity The entity
 * @param args is argument object 
 */
export const handleGamepadConnected: Behavior = (entity: Entity, args: { event: any }): void => {
  input = getMutableComponent(entity, Input);

  console.log('A gamepad connected:', args.event.gamepad, args.event.gamepad.mapping);

  if (args.event.gamepad.mapping !== 'standard') {
    console.error('Non-standard gamepad mapping detected, it could be handled not properly.');
  }

  input.gamepadConnected = true;
  gamepad = args.event.gamepad;

  for (let index = 0; index < gamepad.buttons.length; index++) {
    if (typeof input.gamepadButtons[index] === 'undefined') input.gamepadButtons[index] = 0;
  }
};

/**
 * When a gamepad disconnects
 * 
 * @param {Entity} entity The entity
 * @param args is argument object 
 */
export const handleGamepadDisconnected: Behavior = (entity: Entity, args: { event: any }): void => {
  // Get immutable reference to Input and check if the button is defined -- ignore undefined buttons
  input = getMutableComponent(entity, Input);
  console.log('A gamepad disconnected:', args.event.gamepad);

  input.gamepadConnected = false;

  if (!input.schema || !input.gamepadButtons) return; // Already disconnected?

  for (let index = 0; index < input.gamepadButtons.length; index++) {
    if (
      input.gamepadButtons[index] === BinaryValue.ON &&
      typeof input.schema.gamepadInputMap.axes[index] !== 'undefined'
    ) {
      input.data.set(input.schema.gamepadInputMap.axes[index], {
        type: InputType.BUTTON,
        value: BinaryValue.OFF
      });
    }
    input.gamepadButtons[index] = 0;
  }
};
