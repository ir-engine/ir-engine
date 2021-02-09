import { cameraPointerLock } from "@xr3ngine/engine/src/camera/behaviors/cameraPointerLock";
import { Thumbsticks } from '../../common/enums/Thumbsticks';
import { GamepadButtons } from '../../input/enums/GamepadButtons';
import { MouseInput } from '../../input/enums/MouseInput';
import { InputRelationship } from '../../input/interfaces/InputRelationship';
import { InputSchema } from '../../input/interfaces/InputSchema';
import { DefaultInput } from '../shared/DefaultInput';
import { updateCharacterState } from "./behaviors/updateCharacterState";
import { interact } from "../../interaction/behaviors/interact";
import { InputType } from "../../input/enums/InputType";
import { changeCameraDistanceByDelta } from "../../camera/behaviors/changeCameraDistanceByDelta";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { TouchInputs } from "../../input/enums/TouchInputs";
import { DefaultInputSchema } from "../shared/DefaultInputSchema";
import { CameraInput } from '../../input/enums/CameraInput';
import { fixedCameraBehindCharacter } from "../../camera/behaviors/fixedCameraBehindCharacter";
import { cycleCameraMode } from "../../camera/behaviors/cycleCameraMode";
import { switchShoulderSide } from "../../camera/behaviors/switchShoulderSide";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { InputAlias } from "../../input/types/InputAlias";
import { CharacterComponent } from "./components/CharacterComponent";
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Input } from '@xr3ngine/engine/src/input/components/Input';
import { getComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { Object3DComponent } from '@xr3ngine/engine/src/common/components/Object3DComponent';
import { Mesh } from "three";

const morphNameByInput = {
  [DefaultInput.FACE_EXPRESSION_HAPPY]: "Smile",
  [DefaultInput.FACE_EXPRESSION_SAD]: "Frown",
  // [CameraInput.Disgusted]: "Frown",
  // [CameraInput.Fearful]: "Frown",
  // [CameraInput.Happy]: "Smile",
  // [CameraInput.Surprised]: "Frown",
  // [CameraInput.Sad]: "Frown",
  // [CameraInput.Pucker]: "None",
  // [CameraInput.Widen]: "Frown",
  // [CameraInput.Open]: "Happy"
};

const setCharacterExpression: Behavior = (entity: Entity, args: any): void => {
  // console.log('setCharacterExpression', args.input, morphNameByInput[args.input]);
  const object: Object3DComponent = getComponent<Object3DComponent>(entity, Object3DComponent);
  const body = object.value?.getObjectByName("Body") as Mesh;

  if (!body?.isMesh) {
    return;
  }

  const input: Input = getComponent(entity, Input);
  const inputData = input?.data.get(args.input);
  if (!inputData) {
    return;
  }
  const morphValue = inputData.value;
  const morphName = morphNameByInput[args.input];
  const morphIndex = body.morphTargetDictionary[morphName];
  if (typeof morphIndex !== 'number') {
    return;
  }

  // console.warn(args.input + ": " + morphName + ":" + morphIndex + " = " + morphValue);
  if (morphName && morphValue !== null) {
    if (typeof morphValue === 'number') {
      body.morphTargetInfluences[morphIndex] = morphValue; // 0.0 - 1.0
    }
  }
};

const moveByInputAxis: Behavior = (
  entity: Entity,
  args: { input: InputAlias; inputType: InputType },
  time: any
): void => {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  const input =  getComponent<Input>(entity, Input as any);

  const data = input.data.get(args.input);

  if (data.type === InputType.TWODIM) {
    actor.localMovementDirection.z = data.value[0];
    actor.localMovementDirection.x = data.value[1];
  } else if (data.type === InputType.THREEDIM) {
    // TODO: check if this mapping correct
    actor.localMovementDirection.z = data.value[2];
    actor.localMovementDirection.x = data.value[0];
  }
};

export const setLocalMovementDirection: Behavior = (entity, args: { z?: number; x?: number; y?: number }): void => {
	const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	actor.localMovementDirection.z = args.z ?? actor.localMovementDirection.z;
	actor.localMovementDirection.x = args.x ?? actor.localMovementDirection.x;
	actor.localMovementDirection.y = args.y ?? actor.localMovementDirection.y;
	actor.localMovementDirection.normalize();
};


const lookByInputAxis = (
  entity: Entity,
  args: {
    input: InputAlias; // axis input to take values from
    output: InputAlias; // look input to set values to
    inputType: InputType; // type of value
    multiplier: number; //
  },
  time: any
): void => {
  const input = getMutableComponent<Input>(entity, Input);
  const data = input.data.get(args.input);
  const multiplier = args.multiplier ?? 1;
  // adding very small noise to trigger same value to be "changed"
  // till axis values is not zero, look input should be treated as changed
  const noiseX = (Math.random() > 0.5 ? 1 : -1 ) * 0.0000001;
  const noiseY = (Math.random() > 0.5 ? 1 : -1 ) * 0.0000001;

  if (data.type === InputType.TWODIM) {
    const isEmpty = (Math.abs(data.value[0]) === 0 && Math.abs(data.value[1]) === 0);
    // axis is set, transfer it into output and trigger changed
    if (!isEmpty) {
      input.data.set(args.output, {
        type: data.type,
        value: [
          data.value[0] * multiplier + noiseX,
          data.value[1] * multiplier + noiseY
        ],
        lifecycleState: LifecycleValue.CHANGED
      });
    }
  } else if (data.type === InputType.THREEDIM) {
    // TODO: check if this mapping correct
    const isEmpty = (Math.abs(data.value[0]) === 0 && Math.abs(data.value[2]) === 0);
    if (!isEmpty) {
      input.data.set(args.output, {
        type: data.type,
        value: [
          data.value[0] * multiplier + noiseX,
          data.value[2] * multiplier + noiseY
        ],
        lifecycleState: LifecycleValue.CHANGED
      });
    }
  }
}

export const CharacterInputSchema: InputSchema = {
  ...DefaultInputSchema,
  // Map mouse buttons to abstract input
  mouseInputMap: {
    buttons: {
      [MouseInput.LeftButton]: DefaultInput.PRIMARY,
     [MouseInput.LeftButton]: DefaultInput.INTERACT,
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
      [TouchInputs.Touch1Movement]: DefaultInput.LOOKTURN_PLAYERONE,
      [TouchInputs.Scale]: DefaultInput.CAMERA_SCROLL,
    }
  },
  // Map gamepad buttons to abstract input
  gamepadInputMap: {
    buttons: {
      [GamepadButtons.A]: DefaultInput.INTERACT,
      [GamepadButtons.B]: DefaultInput.JUMP,
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
      [Thumbsticks.Right]: DefaultInput.GAMEPAD_STICK_RIGHT
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
    v: DefaultInput.SWITCH_CAMERA,
    c: DefaultInput.SWITCH_SHOULDER_SIDE,
    f: DefaultInput.LOCKING_CAMERA
  },
  cameraInputMap: {
    [CameraInput.Happy]: DefaultInput.FACE_EXPRESSION_HAPPY,
    [CameraInput.Sad]: DefaultInput.FACE_EXPRESSION_SAD
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
            behavior: () => cameraPointerLock(true),
            args: {}
          }
        ]
    },
    [DefaultInput.SWITCH_CAMERA]: {
        started: [
          {
            behavior: cycleCameraMode,
            args: {}
          }
        ]
    },
    [DefaultInput.LOCKING_CAMERA]: {
      started: [
        {
          behavior: fixedCameraBehindCharacter,
          args: {}
        }
      ]
    },
    [DefaultInput.SWITCH_SHOULDER_SIDE]: {
      started: [
        {
          behavior: switchShoulderSide,
          args: {}
        }
      ]
    },
    [DefaultInput.INTERACT]: {
      started: [
        {
          behavior: interact,
          args: {
            phase:LifecycleValue.STARTED
          }
        }
      ],
      ended: [
        {
          behavior: interact,
          args: {
            phase:LifecycleValue.ENDED
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
    [DefaultInput.FACE_EXPRESSION_HAPPY]: {
      started: [
        {
          behavior: setCharacterExpression,
          args: {
            input: DefaultInput.FACE_EXPRESSION_HAPPY
          }
        }
      ],
      changed: [
        {
          behavior: setCharacterExpression,
          args: {
            input: DefaultInput.FACE_EXPRESSION_HAPPY
          }
        }
      ]
    },
    [DefaultInput.FACE_EXPRESSION_SAD]: {
      started: [
        {
          behavior: setCharacterExpression,
          args: {
            input: DefaultInput.FACE_EXPRESSION_SAD
          }
        }
      ],
      changed: [
        {
          behavior: setCharacterExpression,
          args: {
            input: DefaultInput.FACE_EXPRESSION_SAD
          }
        }
      ]
    },
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
      ],
      unchanged: [
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
      ],
    },
    [DefaultInput.GAMEPAD_STICK_RIGHT]: {
      started: [
        {
          behavior: lookByInputAxis,
          args: {
            input: DefaultInput.GAMEPAD_STICK_RIGHT,
            output: DefaultInput.LOOKTURN_PLAYERONE,
            multiplier: 0.1,
            inputType: InputType.TWODIM
          }
        }
      ],
      changed: [
        {
          behavior: lookByInputAxis,
          args: {
            input: DefaultInput.GAMEPAD_STICK_RIGHT,
            output: DefaultInput.LOOKTURN_PLAYERONE,
            multiplier: 0.1,
            inputType: InputType.TWODIM
          }
        }
      ],
      unchanged: [
        {
          behavior: lookByInputAxis,
          args: {
            input: DefaultInput.GAMEPAD_STICK_RIGHT,
            output: DefaultInput.LOOKTURN_PLAYERONE,
            multiplier: 0.1,
            inputType: InputType.TWODIM
          }
        }
      ]
    }
  }
}
