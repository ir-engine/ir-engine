import { FollowCameraComponent } from '../camera/components/FollowCameraComponent';
import { Behavior } from '../common/interfaces/Behavior';
import { Entity } from '../ecs/classes/Entity';
import { getComponent } from '../ecs/functions/EntityFunctions';
import { Input } from '../input/components/Input';
import { BaseInput } from '../input/enums/BaseInput';
import { Material, Mesh, Vector3 } from "three";
import { SkinnedMesh } from 'three/src/objects/SkinnedMesh';
import { CameraModes } from "../camera/types/CameraModes";
import { LifecycleValue } from "../common/enums/LifecycleValue";
import { GamepadAxis, XRAxes } from '../input/enums/InputEnums';
import { getMutableComponent, hasComponent } from "../ecs/functions/EntityFunctions";
import { CameraInput, GamepadButtons, MouseInput, TouchInputs } from "../input/enums/InputEnums";
import { InputType } from "../input/enums/InputType";
import { InputSchema } from '../input/interfaces/InputSchema';
import { InputAlias } from "../input/types/InputAlias";
import { Interactable } from '../interaction/components/Interactable';
import { Interactor } from '../interaction/components/Interactor';
import { Object3DComponent } from '../scene/components/Object3DComponent';
import { interactOnServer } from '../interaction/systems/InteractiveSystem';
import { CharacterComponent } from "./components/CharacterComponent";
import { isClient } from "../common/functions/isClient";
import { VehicleComponent } from '../vehicle/components/VehicleComponent';
import { isMobileOrTablet } from '../common/functions/isMobile';
import { EquipperComponent } from '../interaction/components/EquipperComponent';
import { TransformComponent } from '../transform/components/TransformComponent';
import { XRUserSettings, XR_ROTATION_MODE } from '../xr/types/XRUserSettings';
import { BinaryValue } from '../common/enums/BinaryValue';
import { ParityValue } from '../common/enums/ParityValue';
import { XRInputSourceComponent } from './components/XRInputSourceComponent';

/**
 *
 * @param entity the one who interacts
 * @param args
 * @param delta
 */

const interact: Behavior = (entity: Entity, args: any = { side: ParityValue }, delta): void => {

  if (!isClient) {
    //TODO: all this function needs to re-think
    interactOnServer(entity, args); //TODO: figure out all this cases
    return;
  }

  const equipperComponent = getComponent(entity, EquipperComponent)
  if(equipperComponent) {
    return;
  }


  if (!hasComponent(entity, Interactor)) {
    console.error(
      'Attempted to call interact behavior, but actor does not have Interactor component'
    );
    return;
  }

  const { focusedInteractive: focusedEntity } = getComponent(entity, Interactor);
  const input = getComponent(entity, Input)
  const mouseScreenPosition = input.data.get(BaseInput.SCREENXY);


  // TODO this might be for mobile controls, but breaks non mobile interact
  // if (mouseScreenPosition && args.phase === LifecycleValue.STARTED ){
  //   startedPosition.set(entity,mouseScreenPosition.value);
  //   return;
  // }


  if (!focusedEntity) {
    console.log('no focused entity')
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
  const intPosition = getComponent(focusedEntity, TransformComponent).position;

  // TODO: use the aabb of the object instead of the transform to get the accurate position
  // if (getInteractiveIsInReachDistance(entity, intPosition, args.side)) {
    if (interactive && typeof interactive.onInteraction === 'function') {
      if (!hasComponent(focusedEntity, VehicleComponent)) {
        interactive.onInteraction(entity, args, delta, focusedEntity);
      } else {
        console.log('Interaction with cars must work only from server');
      }
    } else {
      console.warn('onInteraction is not a function');
    }
  // }

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
  if (follower && follower.mode !== CameraModes.FirstPerson) {
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

let changeTimeout = undefined;
const switchCameraMode = (entity: Entity, args: any = { pointerLock: false, mode: CameraModes.ThirdPerson }): void => {

  if(changeTimeout !== undefined) return;
  changeTimeout = setTimeout(() => {
    clearTimeout(changeTimeout);
    changeTimeout = undefined;
  }, 250);

  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

  const cameraFollow = getMutableComponent(entity, FollowCameraComponent);
  cameraFollow.mode = args.mode

  switch(args.mode) {
    case CameraModes.FirstPerson: {
      cameraFollow.offset.set(0, 1, 0);
      cameraFollow.phi = 0;
      cameraFollow.locked = true;
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

let lastScrollDelta = 0;
/**
 * Change camera distance.
 * @param entity Entity holding camera and input component.
 */
const changeCameraDistanceByDelta: Behavior = (entity: Entity, { input:inputAxes, inputType }: { input: InputAlias; inputType: InputType }): void => {
  const inputComponent = getComponent(entity, Input) as Input;

  if (!inputComponent.data.has(inputAxes)) {
    return;
  }

  const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent);
  if(cameraFollow === undefined) return //console.warn("cameraFollow is undefined");

  const inputPrevValue = inputComponent.prevData.get(inputAxes)?.value as number ?? 0;
  const inputValue = inputComponent.data.get(inputAxes).value as number;

  const delta = Math.min(1, Math.max(-1, inputValue - inputPrevValue)) * (isMobileOrTablet() ? 0.25 : 1);
  if(cameraFollow.mode !== CameraModes.ThirdPerson && delta === lastScrollDelta) {
    return
  }
  lastScrollDelta = delta;

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
  [CameraInput.Neutral]: "None",
  [CameraInput.Angry]: "Frown",
  [CameraInput.Disgusted]: "Frown",
  [CameraInput.Fearful]: "Frown",
  [CameraInput.Happy]: "Smile",
  [CameraInput.Surprised]: "Frown",
  [CameraInput.Sad]: "Frown",
  [CameraInput.Pucker]: "None",
  [CameraInput.Widen]: "Frown",
  [CameraInput.Open]: "Happy"
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

/** 90 degree */
const PI_BY_2 = Math.PI / 2;

/** For Thumbstick angle less than 270 degree substract 90 from it.from
 * Otherwise substract 450 degree. This is to make angle range from -180 to 180 degree.
 */
const changedDirection = (radian: number) => {
  return radian < 3 * PI_BY_2 ? radian =  radian - PI_BY_2 : radian - 5 * PI_BY_2;
}

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
const setWalking: Behavior = (entity, args: { value: number }): void => {
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  actor.moveSpeed = args.value === BinaryValue.ON ? actor.walkSpeed : actor.runSpeed;
};

const setLocalMovementDirection: Behavior = (entity, args: { z?: number; x?: number; y?: number }): void => {
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

  actor.localMovementDirection.z = args.z ?? actor.localMovementDirection.z;
  actor.localMovementDirection.x = args.x ?? actor.localMovementDirection.x;
  actor.localMovementDirection.y = args.y ?? actor.localMovementDirection.y;
  actor.localMovementDirection.normalize();
};


const moveFromXRInputs: Behavior = (entity, args): void => {
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  const input = getComponent<Input>(entity, Input as any);
  const values = input.data.get(BaseInput.XR_MOVE)?.value;
  if(!values) return;

  actor.localMovementDirection.x = values[0] ?? actor.localMovementDirection.x;
  actor.localMovementDirection.z = values[1] ?? actor.localMovementDirection.z;
  actor.localMovementDirection.normalize();
};

let switchChangedToZero = true;
const deg2rad = Math.PI / 180;

const lookFromXRInputs: Behavior = (entity, args): void => {
  const input = getComponent<Input>(entity, Input as any);
  const values = input.data.get(BaseInput.XR_LOOK)?.value;
  const rotationAngle = XRUserSettings.rotationAngle;
  let newAngleDiff = 0;
  switch (XRUserSettings.rotation) {
    case XR_ROTATION_MODE.ANGLED:
      if(switchChangedToZero && values[0] != 0) {
        const plus = XRUserSettings.rotationInvertAxes ? -1 : 1;
        const minus = XRUserSettings.rotationInvertAxes ? 1 : -1;
        const directedAngle = values[0] > 0 ? rotationAngle * plus : rotationAngle * minus;
        newAngleDiff = directedAngle;
        switchChangedToZero = false;
      } else if (!switchChangedToZero && values[0] == 0) {
        switchChangedToZero = true;
      } else if (!switchChangedToZero) {
        newAngleDiff = 0;
      } else if (switchChangedToZero && values[0] == 0) {
        newAngleDiff = 0;
      }
      break;
    case XR_ROTATION_MODE.SMOOTH:
      newAngleDiff = (values[0] * XRUserSettings.rotationSmoothSpeed) * (XRUserSettings.rotationInvertAxes ? -1 : 1);
      break;
  }
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  xrInputSourceComponent.headGroup.rotateY(newAngleDiff * deg2rad)
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
  const noise = (Math.random() > 0.5 ? 1 : -1) * 0.00001;

  if (data.type === InputType.TWODIM) {
    const isEmpty = (Math.abs(data.value[0]) === 0 && Math.abs(data.value[1]) === 0);
    // axis is set, transfer it into output and trigger changed
    if (!isEmpty) {
      input.data.set(args.output, {
        type: data.type,
        value: [
          data.value[0] * multiplier + noise,
          data.value[1] * multiplier + noise
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
          data.value[0] * multiplier + noise,
          data.value[2] * multiplier + noise
        ],
        lifecycleState: LifecycleValue.CHANGED
      });
    }
  }
}

// what do we want this to look like?
// instead of assigning a hardware input to a base input, we want to map them

export const createCharacterInput = () => {
  const map: Map<InputAlias, InputAlias> = new Map();

  map.set(MouseInput.LeftButton, BaseInput.PRIMARY);
  map.set(MouseInput.RightButton, BaseInput.SECONDARY);
  map.set(MouseInput.MiddleButton, BaseInput.INTERACT);

  map.set(MouseInput.MouseMovement, BaseInput.MOUSE_MOVEMENT);
  map.set(MouseInput.MousePosition, BaseInput.SCREENXY);
  map.set(MouseInput.MouseClickDownPosition, BaseInput.SCREENXY_START);
  map.set(MouseInput.MouseClickDownTransformRotation, BaseInput.ROTATION_START);
  map.set(MouseInput.MouseClickDownMovement, BaseInput.LOOKTURN_PLAYERONE);
  map.set(MouseInput.MouseScroll, BaseInput.CAMERA_SCROLL);

  map.set(TouchInputs.Touch, BaseInput.INTERACT);
  map.set(TouchInputs.DoubleTouch, BaseInput.JUMP);
  map.set(TouchInputs.Touch1Position, BaseInput.SCREENXY);
  map.set(TouchInputs.Touch1Movement, BaseInput.LOOKTURN_PLAYERONE);
  map.set(TouchInputs.Scale, BaseInput.CAMERA_SCROLL);

  map.set(GamepadButtons.A, BaseInput.INTERACT);
  map.set(GamepadButtons.B, BaseInput.JUMP);
  map.set(GamepadButtons.LTrigger, BaseInput.GRAB_LEFT);
  map.set(GamepadButtons.RTrigger, BaseInput.GRAB_RIGHT);
  map.set(GamepadButtons.DPad1, BaseInput.FORWARD);
  map.set(GamepadButtons.DPad2, BaseInput.BACKWARD);
  map.set(GamepadButtons.DPad3, BaseInput.LEFT);
  map.set(GamepadButtons.DPad4, BaseInput.RIGHT);

  map.set(GamepadAxis.Left, BaseInput.MOVEMENT_PLAYERONE);
  map.set(GamepadAxis.Right, BaseInput.GAMEPAD_STICK_RIGHT);

  if (XRUserSettings.invertRotationAndMoveSticks) {
    map.set(XRAxes.Left, BaseInput.XR_LOOK);
    map.set(XRAxes.Right, BaseInput.XR_MOVE);
  } else {
    map.set(XRAxes.Left, BaseInput.XR_MOVE);
    map.set(XRAxes.Right, BaseInput.XR_LOOK);
  }

  map.set('w', BaseInput.FORWARD);
  map.set('a', BaseInput.LEFT);
  map.set('s', BaseInput.BACKWARD);
  map.set('d', BaseInput.RIGHT);
  map.set('e', BaseInput.INTERACT);
  map.set(' ', BaseInput.JUMP);
  map.set('shift', BaseInput.WALK);
  map.set('p', BaseInput.POINTER_LOCK);
  map.set('v', BaseInput.SWITCH_CAMERA);
  map.set('c', BaseInput.SWITCH_SHOULDER_SIDE);
  map.set('f', BaseInput.LOCKING_CAMERA);

  map.set(CameraInput.Neutral, CameraInput.Neutral);
  map.set(CameraInput.Angry, CameraInput.Angry);
  map.set(CameraInput.Disgusted, CameraInput.Disgusted);
  map.set(CameraInput.Fearful, CameraInput.Fearful);
  map.set(CameraInput.Happy, CameraInput.Happy);
  map.set(CameraInput.Surprised, CameraInput.Surprised);
  map.set(CameraInput.Sad, CameraInput.Sad);
  map.set(CameraInput.Pucker, CameraInput.Pucker);
  map.set(CameraInput.Widen, CameraInput.Widen);
  map.set(CameraInput.Open, CameraInput.Open);

  return map;
}

export const CharacterInputSchema: InputSchema = {
  onAdded: [],
  onRemoved: [],
  // Map mouse buttons to abstract input
  inputMap: createCharacterInput(),
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
            side: ParityValue.NONE
          }
        }
      ]
    },
    [BaseInput.GRAB_LEFT]: {
      started: [
        {
          behavior: interact,
          args: {
            side: ParityValue.LEFT
          }
        }
      ]
    },
    [BaseInput.GRAB_RIGHT]: {
      started: [
        {
          behavior: interact,
          args: {
            side: ParityValue.RIGHT
          }
        }
      ]
    },
    [BaseInput.JUMP]: {
      started: [
        {
          behavior: setLocalMovementDirection,
          args: {
            y: 1
          }
        }
      ],
      continued: [
        {
          behavior: setLocalMovementDirection,
          args: {
            y: 1
          }
        }
      ],
      ended: [
        {
          behavior: setLocalMovementDirection,
          args: {
            y: 0
          }
        }
      ]
    },
    [BaseInput.WALK]: {
      started: [
        {
          behavior: setWalking,
          args: {
            value: BinaryValue.ON
          }
        }
      ],
      continued: [
        {
          behavior: setWalking,
          args: {
            value: BinaryValue.ON
          }
        }
      ],
      ended: [
        {
          behavior: setWalking,
          args: {
            value: BinaryValue.OFF
          }
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
      ]
    }
  },
  // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
  inputAxisBehaviors: {
    [CameraInput.Happy]: {
      started: [
        {
          behavior: setCharacterExpression,
          args: {
            input: CameraInput.Happy
          }
        }
      ],
      changed: [
        {
          behavior: setCharacterExpression,
          args: {
            input: CameraInput.Happy
          }
        }
      ]
    },
    [CameraInput.Sad]: {
      started: [
        {
          behavior: setCharacterExpression,
          args: {
            input: CameraInput.Sad
          }
        }
      ],
      changed: [
        {
          behavior: setCharacterExpression,
          args: {
            input: CameraInput.Sad
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
      ],
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
      ],
      unchanged: [
        {
          behavior: moveByInputAxis,
          args: {
            input: BaseInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWODIM
          }
        },
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
    },
    [BaseInput.XR_MOVE]: {
      started: [
        {
          behavior: moveFromXRInputs,
        },
      ],
      changed: [
        {
          behavior: moveFromXRInputs,
        },
      ],
      unchanged: [
        {
          behavior: moveFromXRInputs,
        },
      ],
    },
    [BaseInput.XR_LOOK]: {
      started: [
        {
          behavior: lookFromXRInputs,
        },
      ],
      changed: [
        {
          behavior: lookFromXRInputs,
        },
      ],
      unchanged: [
        {
          behavior: lookFromXRInputs,
        },
      ],
    },
  }
}
