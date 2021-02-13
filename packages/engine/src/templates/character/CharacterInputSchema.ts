import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { Input } from '@xr3ngine/engine/src/input/components/Input';
import { BaseInput } from '@xr3ngine/engine/src/input/enums/BaseInput';
import { Material, Mesh } from "three";
import { SkinnedMesh } from 'three/src/objects/SkinnedMesh';
import { CameraComponent } from "../../camera/components/CameraComponent";
import { CameraModes } from "../../camera/types/CameraModes";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { Thumbsticks } from '../../common/enums/Thumbsticks';
import { NumericalType } from "../../common/types/NumericalTypes";
import { getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { CameraInput } from '../../input/enums/CameraInput';
import { GamepadButtons } from '../../input/enums/GamepadButtons';
import { InputType } from "../../input/enums/InputType";
import { MouseInput } from '../../input/enums/MouseInput';
import { TouchInputs } from "../../input/enums/TouchInputs";
import { InputRelationship } from '../../input/interfaces/InputRelationship';
import { InputSchema } from '../../input/interfaces/InputSchema';
import { BaseInputSchema } from "../../input/schema/BaseInputSchema";
import { InputAlias } from "../../input/types/InputAlias";
import { Interactable } from '../../interaction/components/Interactable';
import { Interactor } from '../../interaction/components/Interactor';
import { Object3DComponent } from '../../scene/components/Object3DComponent';
import { updateCharacterState } from "./behaviors/updateCharacterState";
import { CharacterComponent } from "./components/CharacterComponent";

const startedPosition = new Map<Entity,NumericalType>();

/**
 *
 * @param entity the one who interacts
 * @param args
 * @param delta
 */
const interact: Behavior = (entity: Entity, args: any = { }, delta): void => {
  if (!hasComponent(entity, Interactor)) {
    console.error(
      'Attempted to call interact behavior, but actor does not have Interactor component'
    );
    return;
  }
  
  const { focusedInteractive: focusedEntity } = getComponent(entity, Interactor);
  const input = getComponent(entity, Input)
  const mouseScreenPosition = input.data.get(BaseInput.SCREENXY);

  if (mouseScreenPosition && args.phase === LifecycleValue.STARTED ){
    startedPosition.set(entity,mouseScreenPosition.value);
    return;
  }
  if (!focusedEntity) {
    // no available interactive object is focused right now
    return;
  }

  if (!hasComponent(focusedEntity, Interactable)) {
    console.error(
      'Attempted to call interact behavior, but target does not have Interactive component'
    );
    return;
  }

  const interactive = getComponent(focusedEntity, Interactable);
  if (interactive && typeof interactive.onInteraction === 'function') {
    interactive.onInteraction(entity, args, delta, focusedEntity);
  } else {
    console.warn('onInteraction is not a function');
  }

};

/**
 * Switch Camera mode from first person to third person and wise versa.
 * @param entity Entity holding {@link camera/components/FollowCameraComponent.FollowCameraComponent | Follow camera} component.
 */
const cycleCameraMode: Behavior = (entity: Entity, args: any): void => {
  const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent);

    switch(cameraFollow?.mode) {
        case CameraModes.FirstPerson: switchCameraMode(entity, { mode: CameraModes.ShoulderCam }); break;
        case CameraModes.ShoulderCam: switchCameraMode(entity, { mode: CameraModes.ThirdPerson }); cameraFollow.distance = cameraFollow.minDistance + 1; break;
        case CameraModes.ThirdPerson: switchCameraMode(entity, { mode: CameraModes.TopDown }); break;
        case CameraModes.TopDown: switchCameraMode(entity, { mode: CameraModes.FirstPerson }); break;
        default: break;
    }
};
/**
 * Fix camera behind the character to follow the character.
 * @param entity Entity on which camera will be fixed.
 */
const fixedCameraBehindCharacter: Behavior = (entity: Entity, args: any, delta: number): void => {
  const follower = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent);

  if (CameraComponent.instance && follower && follower.mode !== CameraModes.FirstPerson) {
    follower.locked = !follower.locked
  }
  
};

const switchShoulderSide: Behavior = (entity: Entity, args: any, detla: number ): void => {
  const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent);
  if(cameraFollow) {
    cameraFollow.shoulderSide = !cameraFollow.shoulderSide;
    cameraFollow.offset.x = -cameraFollow.offset.x;
  }
};

const setVisible = (character: CharacterComponent, visible: boolean): void => {
  if(character.visible !== visible) {
    character.visible = visible;
    character.tiltContainer.traverse((obj) => {
      const mat = (obj as SkinnedMesh).material;
      if(mat) {
        (mat as Material).visible = visible;
      }
    });
  }
};

const switchCameraMode = (entity: Entity, args: any = { pointerLock: false, mode: CameraModes.ThirdPerson }): void => {
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

  const cameraFollow = getMutableComponent(entity, FollowCameraComponent);
  cameraFollow.mode = args.mode

  switch(args.mode) {
    case CameraModes.FirstPerson: {
      cameraFollow.offset.set(0, 1, 0);
      cameraFollow.phi = 0;
      setVisible(actor, false);
    } break;

    case CameraModes.ShoulderCam: {
      cameraFollow.offset.set(cameraFollow.shoulderSide ? -0.25 : 0.25, 1, 0);
      setVisible(actor, true);
    } break;

    default: case CameraModes.ThirdPerson: {
      cameraFollow.offset.set(cameraFollow.shoulderSide ? -0.25 : 0.25, 1, 0);
      setVisible(actor, true);
    } break;

    case CameraModes.TopDown: {
      cameraFollow.offset.set(0, 1, 0);
      setVisible(actor, true);
    } break;
  }
};

/**
 * Change camera distance.
 * @param entity Entity holding camera and input component.
 */
const changeCameraDistanceByDelta: Behavior = (entity: Entity, { input:inputAxes, inputType }: { input: InputAlias; inputType: InputType }): void => {
  const inputComponent = getComponent(entity, Input) as Input;

  if (!inputComponent.data.has(inputAxes)) {
    return;
  }

  const inputPrevValue = inputComponent.prevData.get(inputAxes)?.value as number ?? 0;
  const inputValue = inputComponent.data.get(inputAxes).value as number;

  const delta = inputValue - inputPrevValue;

  const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent);
  if(cameraFollow === undefined) return //console.warn("cameraFollow is undefined");

  switch(cameraFollow.mode) {
    case CameraModes.FirstPerson: 
      if(delta > 0) { 
        switchCameraMode(entity, { mode: CameraModes.ShoulderCam })
      }
    break;
    case CameraModes.ShoulderCam: 
      if(delta > 0) {
        switchCameraMode(entity, { mode: CameraModes.ThirdPerson })
        cameraFollow.distance = cameraFollow.minDistance + 1
      }
      if(delta < 0) {
        switchCameraMode(entity, { mode: CameraModes.FirstPerson })
      }
    break;
    default: case CameraModes.ThirdPerson:  
      const newDistance = cameraFollow.distance + delta;
      cameraFollow.distance = Math.max(cameraFollow.minDistance, Math.min( cameraFollow.maxDistance, newDistance));

      if(cameraFollow.distance >= cameraFollow.maxDistance) {
        if(delta > 0) {
          switchCameraMode(entity, { mode: CameraModes.TopDown })
        }
      } else if(cameraFollow.distance <= cameraFollow.minDistance) {
        if(delta < 0) {
          switchCameraMode(entity, { mode: CameraModes.ShoulderCam })
        }
      }
  
    break;
    case CameraModes.TopDown: 
      if(delta < 0) {
        switchCameraMode(entity, { mode: CameraModes.ThirdPerson })
      } 
    break;
  }
};

const morphNameByInput = {
  [BaseInput.FACE_EXPRESSION_HAPPY]: "Smile",
  [BaseInput.FACE_EXPRESSION_SAD]: "Frown",
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
  const input = getComponent<Input>(entity, Input as any);

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

const setLocalMovementDirection: Behavior = (entity, args: { z?: number; x?: number; y?: number }): void => {
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
  const noiseX = (Math.random() > 0.5 ? 1 : -1) * 0.0000001;
  const noiseY = (Math.random() > 0.5 ? 1 : -1) * 0.0000001;

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
  ...BaseInputSchema,
  // Map mouse buttons to abstract input
  mouseInputMap: {
    buttons: {
      [MouseInput.LeftButton]: BaseInput.PRIMARY,
      [MouseInput.LeftButton]: BaseInput.INTERACT,
      [MouseInput.RightButton]: BaseInput.SECONDARY,
      [MouseInput.MiddleButton]: BaseInput.INTERACT
    },
    axes: {
      [MouseInput.MouseMovement]: BaseInput.MOUSE_MOVEMENT,
      [MouseInput.MousePosition]: BaseInput.SCREENXY,
      [MouseInput.MouseClickDownPosition]: BaseInput.SCREENXY_START,
      [MouseInput.MouseClickDownTransformRotation]: BaseInput.ROTATION_START,
      [MouseInput.MouseClickDownMovement]: BaseInput.LOOKTURN_PLAYERONE,
      [MouseInput.MouseScroll]: BaseInput.CAMERA_SCROLL
    }
  },
  // Map touch buttons to abstract input
  touchInputMap: {
    buttons: {
      [TouchInputs.Touch]: BaseInput.INTERACT,
    },
    axes: {
      [TouchInputs.Touch1Position]: BaseInput.SCREENXY,
      [TouchInputs.Touch1Movement]: BaseInput.LOOKTURN_PLAYERONE,
      [TouchInputs.Scale]: BaseInput.CAMERA_SCROLL,
    }
  },
  // Map gamepad buttons to abstract input
  gamepadInputMap: {
    buttons: {
      [GamepadButtons.A]: BaseInput.INTERACT,
      [GamepadButtons.B]: BaseInput.JUMP,
      // [GamepadButtons.B]: BaseInput.CROUCH, // B - back
      // [GamepadButtons.X]: BaseInput.WALK, // X - secondary input
      // [GamepadButtons.Y]: BaseInput.INTERACT, // Y - tertiary input
      // 4: BaseInput.DEFAULT, // LB
      // 5: BaseInput.DEFAULT, // RB
      // 6: BaseInput.DEFAULT, // LT
      // 7: BaseInput.DEFAULT, // RT
      // 8: BaseInput.DEFAULT, // Back
      // 9: BaseInput.DEFAULT, // Start
      // 10: BaseInput.DEFAULT, // LStick
      // 11: BaseInput.DEFAULT, // RStick
      [GamepadButtons.DPad1]: BaseInput.FORWARD, // DPAD 1
      [GamepadButtons.DPad2]: BaseInput.BACKWARD, // DPAD 2
      [GamepadButtons.DPad3]: BaseInput.LEFT, // DPAD 3
      [GamepadButtons.DPad4]: BaseInput.RIGHT // DPAD 4
    },
    axes: {
      [Thumbsticks.Left]: BaseInput.MOVEMENT_PLAYERONE,
      [Thumbsticks.Right]: BaseInput.GAMEPAD_STICK_RIGHT
    }
  },
  // Map keyboard buttons to abstract input
  keyboardInputMap: {
    w: BaseInput.FORWARD,
    a: BaseInput.LEFT,
    s: BaseInput.BACKWARD,
    d: BaseInput.RIGHT,
    e: BaseInput.INTERACT,
    ' ': BaseInput.JUMP,
    shift: BaseInput.WALK,
    p: BaseInput.POINTER_LOCK,
    v: BaseInput.SWITCH_CAMERA,
    c: BaseInput.SWITCH_SHOULDER_SIDE,
    f: BaseInput.LOCKING_CAMERA
  },
  cameraInputMap: {
    [CameraInput.Happy]: BaseInput.FACE_EXPRESSION_HAPPY,
    [CameraInput.Sad]: BaseInput.FACE_EXPRESSION_SAD
  },
  // Map how inputs relate to each other
  inputRelationships: {
    [BaseInput.FORWARD]: { opposes: [BaseInput.BACKWARD] } as InputRelationship,
    [BaseInput.BACKWARD]: { opposes: [BaseInput.FORWARD] } as InputRelationship,
    [BaseInput.LEFT]: { opposes: [BaseInput.RIGHT] } as InputRelationship,
    [BaseInput.RIGHT]: { opposes: [BaseInput.LEFT] } as InputRelationship,
    [BaseInput.JUMP]: {} as InputRelationship
  },
  // "Button behaviors" are called when button input is called (i.e. not axis input)
  inputButtonBehaviors: {
    [BaseInput.SWITCH_CAMERA]: {
      started: [
        {
          behavior: cycleCameraMode,
          args: {}
        }
      ]
    },
    [BaseInput.LOCKING_CAMERA]: {
      started: [
        {
          behavior: fixedCameraBehindCharacter,
          args: {}
        }
      ]
    },
    [BaseInput.SWITCH_SHOULDER_SIDE]: {
      started: [
        {
          behavior: switchShoulderSide,
          args: {}
        }
      ]
    },
    [BaseInput.INTERACT]: {
      started: [
        {
          behavior: interact,
          args: {
            phase: LifecycleValue.STARTED
          }
        }
      ],
      ended: [
        {
          behavior: interact,
          args: {
            phase: LifecycleValue.ENDED
          }
        }
      ]
    },
    [BaseInput.JUMP]: {
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
    [BaseInput.WALK]: {
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
    [BaseInput.FORWARD]: {
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
    [BaseInput.BACKWARD]: {
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
    [BaseInput.LEFT]: {
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
    [BaseInput.RIGHT]: {
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
    [BaseInput.FACE_EXPRESSION_HAPPY]: {
      started: [
        {
          behavior: setCharacterExpression,
          args: {
            input: BaseInput.FACE_EXPRESSION_HAPPY
          }
        }
      ],
      changed: [
        {
          behavior: setCharacterExpression,
          args: {
            input: BaseInput.FACE_EXPRESSION_HAPPY
          }
        }
      ]
    },
    [BaseInput.FACE_EXPRESSION_SAD]: {
      started: [
        {
          behavior: setCharacterExpression,
          args: {
            input: BaseInput.FACE_EXPRESSION_SAD
          }
        }
      ],
      changed: [
        {
          behavior: setCharacterExpression,
          args: {
            input: BaseInput.FACE_EXPRESSION_SAD
          }
        }
      ]
    },
    [BaseInput.CAMERA_SCROLL]: {
      started: [
        {
          behavior: changeCameraDistanceByDelta,
          args: {
            input: BaseInput.CAMERA_SCROLL,
            inputType: InputType.ONEDIM
          }
        }
      ],
      changed: [
        {
          behavior: changeCameraDistanceByDelta,
          args: {
            input: BaseInput.CAMERA_SCROLL,
            inputType: InputType.ONEDIM
          }
        }
      ],
      unchanged: [
        {
          behavior: changeCameraDistanceByDelta,
          args: {
            input: BaseInput.CAMERA_SCROLL,
            inputType: InputType.ONEDIM
          }
        }
      ]
    },
    [BaseInput.MOVEMENT_PLAYERONE]: {
      started: [
        {
          behavior: moveByInputAxis,
          args: {
            input: BaseInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWODIM
          }
        }
      ],
      changed: [
        {
          behavior: moveByInputAxis,
          args: {
            input: BaseInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWODIM
          }
        },
        {
          behavior: updateCharacterState
        }
      ],
    },
    [BaseInput.GAMEPAD_STICK_RIGHT]: {
      started: [
        {
          behavior: lookByInputAxis,
          args: {
            input: BaseInput.GAMEPAD_STICK_RIGHT,
            output: BaseInput.LOOKTURN_PLAYERONE,
            multiplier: 0.1,
            inputType: InputType.TWODIM
          }
        }
      ],
      changed: [
        {
          behavior: lookByInputAxis,
          args: {
            input: BaseInput.GAMEPAD_STICK_RIGHT,
            output: BaseInput.LOOKTURN_PLAYERONE,
            multiplier: 0.1,
            inputType: InputType.TWODIM
          }
        }
      ],
      unchanged: [
        {
          behavior: lookByInputAxis,
          args: {
            input: BaseInput.GAMEPAD_STICK_RIGHT,
            output: BaseInput.LOOKTURN_PLAYERONE,
            multiplier: 0.1,
            inputType: InputType.TWODIM
          }
        }
      ]
    }
  }
}
