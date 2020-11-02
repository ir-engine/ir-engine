import { cameraPointerLock } from "@xr3ngine/engine/src/camera/behaviors/cameraPointerLock";
import { switchCameraMode } from "@xr3ngine/engine/src/camera/behaviors/switchCameraMode";
import { Thumbsticks } from '../../common/enums/Thumbsticks';
import { GamepadButtons } from '../../input/enums/GamepadButtons';
import { MouseInput } from '../../input/enums/MouseInput';
import { InputRelationship } from '../../input/interfaces/InputRelationship';
import { InputSchema } from '../../input/interfaces/InputSchema';
import { DefaultInput } from '../shared/DefaultInput';
import { updateCharacterState } from "./behaviors/updateCharacterState";
import { interact } from "../../interaction/behaviors/interact";
import { moveByInputAxis } from "./behaviors/move";
import { InputType } from "../../input/enums/InputType";
import { setLocalMovementDirection } from "./behaviors/setLocalMovementDirection";
import { changeCameraDistanceByDelta } from "../../camera/behaviors/changeCameraDistanceByDelta";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { TouchInputs } from "../../input/enums/TouchInputs";
import { DefaultInputSchema } from "../shared/DefaultInputSchema";

export const CharacterInputSchema: InputSchema = {
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
  // Map touch buttons to abstract input
  touchInputMap: {
    buttons: {
      [TouchInputs.Touch]: DefaultInput.INTERACT,
    },
    axes: {
      [TouchInputs.Touch1Position]: DefaultInput.SCREENXY,
      [TouchInputs.Touch1Movement]: DefaultInput.LOOKTURN_PLAYERONE
    }
  },
  // Map gamepad buttons to abstract input
  gamepadInputMap: {
    buttons: {
      [GamepadButtons.A]: DefaultInput.INTERACT,
      // [GamepadButtons.A]: DefaultInput.JUMP,
      // [GamepadButtons.B]: DefaultInput.CROUCH, // B - back
      // [GamepadButtons.X]: DefaultInput.SPRINT, // X - secondary input
      // [GamepadButtons.Y]: DefaultInput.INTERACT, // Y - tertiary input
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
    e: DefaultInput.INTERACT,
    ' ': DefaultInput.JUMP,
    shift: DefaultInput.SPRINT,
    p: DefaultInput.POINTER_LOCK,
    v: DefaultInput.SWITCH_CAMERA
  },
  // Map how inputs relate to each other
  inputRelationships: {
    [DefaultInput.FORWARD]: { opposes: [DefaultInput.BACKWARD] } as InputRelationship,
    [DefaultInput.BACKWARD]: { opposes: [DefaultInput.FORWARD] } as InputRelationship,
    [DefaultInput.LEFT]: { opposes: [DefaultInput.RIGHT] } as InputRelationship,
    [DefaultInput.RIGHT]: { opposes: [DefaultInput.LEFT] } as InputRelationship,
    [DefaultInput.JUMP]: {} as InputRelationship
  },
  // "Button behaviors" are called when button input is called (i.e. not axis input)
  inputButtonBehaviors: {
    [DefaultInput.POINTER_LOCK]: {
        started: [
          {
            behavior: cameraPointerLock,
            args: {}
          }
        ]
    },
    [DefaultInput.SWITCH_CAMERA]: {
        started: [
          {
            behavior: switchCameraMode,
            args: {}
          }
        ]
    },
    [DefaultInput.INTERACT]: {
      started: [
        {
          behavior: interact,
          args: {
            phaze:LifecycleValue.STARTED
          }
        }
      ],
      ended: [
        {
          behavior: interact,
          args: {
            phaze:LifecycleValue.ENDED
          }
        }
      ]
    },
    [DefaultInput.JUMP]: {
        started: [
          {
            behavior: updateCharacterState,
            args: {}
          }
        ],
      ended: [
        {
          behavior: updateCharacterState,
          args: {}
        }
      ]
    },
    [DefaultInput.SPRINT]: {
        started: [
          {
            behavior: updateCharacterState,
            args: {}
          }
        ],
      ended: [
        {
          behavior: updateCharacterState,
          args: {}
        }
      ]
    },
    [DefaultInput.FORWARD]: {
        started: [
          {
            behavior: setLocalMovementDirection,
            args: {
              z: 1
            }
          }
        ],
        continued: [
          {
            behavior: setLocalMovementDirection,
            args: {
              z: 1
            }
          }
        ],
      ended: [
        {
          behavior: setLocalMovementDirection,
          args: {
            z: 0
          }
        },
        {
          behavior: updateCharacterState,
          args: {}
        }
      ]
    },
    [DefaultInput.BACKWARD]: {
        started: [
          {
            behavior: setLocalMovementDirection,
            args: {
              z: -1
            }
          }
        ],
        continued: [
          {
            behavior: setLocalMovementDirection,
            args: {
              z: -1
            }
          }
        ],
      ended: [
        {
          behavior: setLocalMovementDirection,
          args: {
            z: 0
          }
        },
        {
          behavior: updateCharacterState,
          args: {}
        }
      ]
    },
    [DefaultInput.LEFT]: {
        started: [
          {
            behavior: setLocalMovementDirection,
            args: {
              x: 1
            }
          }
        ],
        continued: [
          {
            behavior: setLocalMovementDirection,
            args: {
              x: 1
            }
          }
        ],
      ended: [
        {
          behavior: setLocalMovementDirection,
          args: {
            x: 0
          }
        },
        {
          behavior: updateCharacterState,
          args: {}
        }
      ]
    },
    [DefaultInput.RIGHT]: {
        started: [
          {
            behavior: setLocalMovementDirection,
            args: {
              x: -1
            }
          }
        ],
        continued: [
          {
            behavior: setLocalMovementDirection,
            args: {
              x: -1
            }
          }
        ],
      ended: [
        {
          behavior: setLocalMovementDirection,
          args: {
            x: 0
          }
        },
        {
          behavior: updateCharacterState,
          args: {}
        }
      ]
    }
  },
  // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
  inputAxisBehaviors: {
    [DefaultInput.CAMERA_SCROLL]: {
      started: [
        {
          behavior: changeCameraDistanceByDelta,
          args: {
            input: DefaultInput.CAMERA_SCROLL,
            inputType: InputType.ONEDIM
          }
        }
      ],
      changed: [
        {
          behavior: changeCameraDistanceByDelta,
          args: {
            input: DefaultInput.CAMERA_SCROLL,
            inputType: InputType.ONEDIM
          }
        }
      ]
    },
    [DefaultInput.MOVEMENT_PLAYERONE]: {
      started: [
        {
          behavior: moveByInputAxis,
          args: {
            input: DefaultInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWODIM
          }
        }
      ],
      changed: [
        {
          behavior: moveByInputAxis,
          args: {
            input: DefaultInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWODIM
          }
        },
        {
          behavior: updateCharacterState,
          args: {
            setCameraRelativeOrientationTarget: true
          }
        }
      ]
    }
  }
};
