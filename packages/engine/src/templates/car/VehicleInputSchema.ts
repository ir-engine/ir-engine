import { Thumbsticks } from '../../common/enums/Thumbsticks';
import { GamepadButtons } from '../../input/enums/GamepadButtons';
import { InputType } from '../../input/enums/InputType';
import { MouseInput } from '../../input/enums/MouseInput';
import { InputRelationship } from '../../input/interfaces/InputRelationship';
import { InputSchema } from '../../input/interfaces/InputSchema';
import { drive, driveByInputAxis, stop } from '@xr3ngine/engine/src/physics/behaviors/driveBehavior';
import { cameraPointerLock } from "@xr3ngine/engine/src/camera/behaviors/cameraPointerLock";
import { getOutCar } from '@xr3ngine/engine/src/templates/car/behaviors/getOutCarBehavior';
import { DefaultInput } from '../shared/DefaultInput';
import { driveSteering } from "../../physics/behaviors/driveSteeringBehavior";
// import { honk } from './behaviors/honk';
import { driveHandBrake } from "../../physics/behaviors/driveHandBrake";
import { changeColor } from "./behaviors/changeColor";
import { DefaultInputSchema } from "../shared/DefaultInputSchema";
import { LifecycleValue } from "../../common/enums/LifecycleValue";

export const VehicleInputSchema: InputSchema = {
  ...DefaultInputSchema,
  // Map mouse buttons to abstract input
  mouseInputMap: {
    buttons: {
      [MouseInput.LeftButton]: DefaultInput.PRIMARY,
    //  [MouseInput.LeftButton]: DefaultInput.INTERACT,
      [MouseInput.RightButton]: DefaultInput.SECONDARY,
      [MouseInput.MiddleButton]: DefaultInput.INTERACT
    },
    axes: {
      [MouseInput.MouseMovement]: DefaultInput.MOUSE_MOVEMENT,
      [MouseInput.MousePosition]: DefaultInput.SCREENXY,
      [MouseInput.MouseClickDownPosition]: DefaultInput.SCREENXY_START,
      [MouseInput.MouseClickDownTransformRotation]: DefaultInput.ROTATION_START,
      [MouseInput.MouseClickDownMovement]: DefaultInput.LOOKTURN_PLAYERONE,
      [MouseInput.MouseScroll]: DefaultInput.CAMERA_SCROLL
    }
  },
  // Map gamepad buttons to abstract input
  gamepadInputMap: {
    buttons: {
      [GamepadButtons.A]: DefaultInput.JUMP,
      [GamepadButtons.B]: DefaultInput.CROUCH, // B - back
      [GamepadButtons.X]: DefaultInput.SPRINT, // X - secondary input
      [GamepadButtons.Y]: DefaultInput.INTERACT, // Y - tertiary input
      // 4: DefaultInput.DEFAULT, // LB
      // 5: DefaultInput.DEFAULT, // RB
      // 6: DefaultInput.DEFAULT, // LT
      // 7: DefaultInput.DEFAULT, // RT
      // 8: DefaultInput.DEFAULT, // Back
      // 9: DefaultInput.DEFAULT, // Start
      // 10: DefaultInput.DEFAULT, // LStick
      // 11: DefaultInput.DEFAULT, // RStick
      [GamepadButtons.DPad1]: DefaultInput.FORWARD, // DPAD 1
      [GamepadButtons.DPad2]: DefaultInput.BACKWARD, // DPAD 2
      [GamepadButtons.DPad3]: DefaultInput.LEFT, // DPAD 3
      [GamepadButtons.DPad4]: DefaultInput.RIGHT // DPAD 4
    },
    axes: {
      [Thumbsticks.Left]: DefaultInput.MOVEMENT_PLAYERONE,
      [Thumbsticks.Right]: DefaultInput.LOOKTURN_PLAYERONE
    }
  },
  // Map keyboard buttons to abstract input
  keyboardInputMap: {
    w: DefaultInput.FORWARD,
    a: DefaultInput.LEFT,
    s: DefaultInput.BACKWARD,
    d: DefaultInput.RIGHT,
    ' ': DefaultInput.JUMP,
    shift: DefaultInput.CROUCH,
    p: DefaultInput.POINTER_LOCK,
    e: DefaultInput.INTERACT,
    c: DefaultInput.SECONDARY
  },
  // Map how inputs relate to each other
  inputRelationships: {
    [DefaultInput.FORWARD]: {opposes: [DefaultInput.BACKWARD]} as InputRelationship,
    [DefaultInput.BACKWARD]: {opposes: [DefaultInput.FORWARD]} as InputRelationship,
    [DefaultInput.LEFT]: {opposes: [DefaultInput.RIGHT]} as InputRelationship,
    [DefaultInput.RIGHT]: {opposes: [DefaultInput.LEFT]} as InputRelationship,
    [DefaultInput.CROUCH]: {blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT]} as InputRelationship,
    [DefaultInput.JUMP]: {overrides: [DefaultInput.CROUCH]} as InputRelationship
  },
  // "Button behaviors" are called when button input is called (i.e. not axis input)
  inputButtonBehaviors: {
    [DefaultInput.SECONDARY]: {
      ended: [
        {
          behavior: changeColor,
          args: { materialName: "Main" }
        }
      ]
    },
    [DefaultInput.INTERACT]:  {
      started: [
        {
          behavior: getOutCar,
          args: {
            phaze:LifecycleValue.STARTED
          }
        }
      ]
    },
    [DefaultInput.POINTER_LOCK]: {
      ended: [
        {
          behavior: cameraPointerLock,
          args: {}
        }
      ]
    },
    [DefaultInput.FORWARD]: {
      started: [
        {
          behavior: drive,
          args: {
            direction: 1
          }
        }
      ],
      continued: [
        {
          behavior: drive,
          args: {
            direction: 1
          }
        }
      ],
      ended: [
        {
          behavior: stop,
          args: {
            direction: 0
          }
        }
      ]
    },
    [DefaultInput.BACKWARD]: {
      started: [
        {
          behavior: drive,
          args: {
            direction: -1
          }
        }
      ],
      continued: [
        {
          behavior: drive,
          args: {
            direction: -1
          }
        }
      ],
      ended: [
        {
          behavior: stop,
          args: {
            direction: 0
          }
        }
      ]
    },
    [DefaultInput.LEFT]: {
      started: [
        {
          behavior: driveSteering,
          args: {
            direction: 1
          }
        }
      ],
      continued: [
        {
          behavior: driveSteering,
          args: {
            direction: 1
          }
        }
      ],
      ended: [
        {
          behavior: driveSteering,
          args: {
            direction: 0
          }
        }
      ]
    },
    [DefaultInput.RIGHT]: {
      started: [
        {
          behavior: driveSteering,
          args: {
            direction: -1
          }
        }
      ],
      continued: [
        {
          behavior: driveSteering,
          args: {
            direction: -1
          }
        }
      ],
      ended: [
        {
          behavior: driveSteering,
          args: {
            direction: 0
          }
        }
      ]
    },
    [DefaultInput.JUMP]: {
      started: [
        {
          behavior: driveHandBrake,
          args: {
            on: true
          }
        }
      ],
      continued: [
        {
          behavior: driveHandBrake,
          args: {
            on: true
          }
        }
      ],
      ended: [
        {
          behavior: driveHandBrake,
          args: {
            on: false
          }
        }
      ],
    },
  },
  // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
  inputAxisBehaviors: {
    [DefaultInput.MOVEMENT_PLAYERONE]: {
      started: [
        {
          behavior: driveByInputAxis,
          args: {
            input: DefaultInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWODIM
          }
        }
      ],
      changed: [
        {
          behavior: driveByInputAxis,
          args: {
            input: DefaultInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWODIM
          }
        }
      ]
    }
  }
};
