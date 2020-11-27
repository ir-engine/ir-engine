import { BinaryValue } from '../../common/enums/BinaryValue';
import { applyThreshold } from '../../common/functions/applyThreshold';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { InputType } from '../enums/InputType';
import { InputAlias } from '../types/InputAlias';
import { Input } from '../components/Input';

const inputPerGamepad = 2;
let input: Input;
let gamepads: Gamepad[];
let input0: number;
let input1: number;
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
      input0 = inputPerGamepad * _index;
      input1 = inputPerGamepad * _index + 1;

      // GamePad 0 LStick XY
      if (input.schema.eventBindings.input[input0] && gamepad.axes.length >= inputPerGamepad) {
        handleGamepadAxis(entity, {
          gamepad: gamepad,
          inputIndex: 0,
          mappedInputValue: input.schema.gamepadInputMap.axes[input0]
        });
      }

      // GamePad 1 LStick XY
      if (input.schema.gamepadInputMap.axes[input1] && gamepad.axes.length >= inputPerGamepad * 2) {
        handleGamepadAxis(entity, {
          gamepad,
          inputIndex: 1,
          mappedInputValue: input.schema.gamepadInputMap.axes[input1]
        });
      }
    }

    // If the gamepad doesn't have buttons, or the input isn't mapped, return
    if (!gamepad.buttons || !input.schema.gamepadInputMap.axes) return;

    // Otherwise, loop through gamepad buttons
    for (_index = 0; _index < gamepad.buttons.length; _index++) {
      handleGamepadButton(entity, {
        gamepad,
        index: _index,
        mappedInputValue: input.schema.gamepadInputMap.axes[input1]
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
    typeof input.schema.gamepadInputMap.axes[args.index] === 'undefined' ||
    gamepad.buttons[args.index].touched === (input.gamepadButtons[args.index] === BinaryValue.ON)
  ) { return; }
  // Set input data
  input.data.set(input.schema.gamepadInputMap.axes[args.index], {
    type: InputType.BUTTON,
    value: gamepad.buttons[args.index].touched ? BinaryValue.ON : BinaryValue.OFF
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

  x = applyThreshold(gamepad.axes[inputBase], input.gamepadThreshold);
  y = applyThreshold(gamepad.axes[inputBase + 1], input.gamepadThreshold);
  prevLeftX = input.gamepadInput[inputBase];
  prevLeftY = input.gamepadInput[inputBase + 1];

  // Axis has changed, so get mutable reference to Input and set data
  if (x !== prevLeftX || y !== prevLeftY) {
    getMutableComponent<Input>(entity, Input).data.set(args.mappedInputValue, {
      type: InputType.TWODIM,
      value: [x, y]
    });

    input.gamepadInput[inputBase] = x;
    input.gamepadInput[inputBase + 1] = y;
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

  console.log("args: " + args);
  console.log('A gamepad connected:', args.event.gamepad, args.event.gamepad.mapping);

  if (args.event.gamepad.mapping !== 'standard') { return console.error('Non-standard gamepad mapping detected, not properly handled'); }

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

  if (!input.schema) return; // Already disconnected?

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
