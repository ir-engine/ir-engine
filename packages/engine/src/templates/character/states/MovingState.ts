import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { physicsMove } from '../../../physics/behaviors/physicsMove';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { CharacterAnimations } from '../CharacterAnimations';
import { CharacterComponent } from '../components/CharacterComponent';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { updateVectorAnimation, clearAnimOnChange, changeAnimation } from '../../../character/functions/updateVectorAnimation';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { MathUtils, Vector3 } from "three";

import { isMyPlayer } from '../../../common/functions/isMyPlayer';
import { isOtherPlayer } from '../../../common/functions/isOtherPlayer';
import { isMobileOrTablet } from '../../../common/functions/isMobile';
import { Engine } from '../../../ecs/classes/Engine';
// import { WebXRRendererSystem } from '../../../renderer/WebXRRendererSystem';
import { applyVectorMatrixXZ } from '../../../common/functions/applyVectorMatrixXZ';
import { FollowCameraComponent } from '../../../camera/components/FollowCameraComponent';
import { CameraModes } from '../../../camera/types/CameraModes';
import { Input } from '../../../input/components/Input';
import { NumericalType } from '../../../common/types/NumericalTypes';
import { LifecycleValue } from '../../../common/enums/LifecycleValue';
import { BaseInput } from '../../../input/enums/BaseInput';

let prevState;
const emptyInputValue = [0, 0] as NumericalType;

/**
 * Get Input data from the device.
 *
 * @param inputComponent Input component which is holding input data.
 * @param inputAxes Axes of the input.
 * @param forceRefresh
 *
 * @returns Input value from input component.
 */
 const getInputData = (inputComponent: Input, inputAxes: number, prevValue: NumericalType ): { 
  currentInputValue: NumericalType;
  inputValue: NumericalType
} => {
  const result = {
    currentInputValue: emptyInputValue,
    inputValue: emptyInputValue,
  }
  if (!inputComponent?.data.has(inputAxes)) return result;

  const inputData = inputComponent.data.get(inputAxes);
  result.currentInputValue = inputData.value;
  result.inputValue = inputData.lifecycleState === LifecycleValue.ENDED ||
    JSON.stringify(result.currentInputValue) === JSON.stringify(prevValue)
      ? emptyInputValue : result.currentInputValue;
  return result;
}

const downVector = new Vector3(0, -1, 0)
const leftVector = new Vector3(1, 0, 0);
const upVector = new Vector3(0, 1, 0);
const forwardVector = new Vector3(0, 0, 1);
const emptyVector = new Vector3();
const damping = 0.05; // To reduce the change in direction.
const halfPI = Math.PI / 2;

export const updateCharacterState: Behavior = (entity, args: { }, deltaTime: number): void => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if (!actor.initialized) return console.warn("Actor no initialized");
  const actorTransform = getMutableComponent(entity, TransformComponent);
  
	actor.timer += deltaTime;

	const localMovementDirection = actor.localMovementDirection; //getLocalMovementDirection(entity);

  if(actor.moveVectorSmooth.position.length() < 0.1) { actor.moveVectorSmooth.velocity.multiplyScalar(0.9) }
  if(actor.moveVectorSmooth.position.length() < 0.001) { actor.moveVectorSmooth.velocity.set(0,0,0); actor.moveVectorSmooth.position.set(0,0,0); }

  if(actor.changedViewAngle) {
    const viewVectorAngle = Math.atan2(actor.viewVector.z, actor.viewVector.x);
    actor.viewVector.x = Math.cos(viewVectorAngle - (actor.changedViewAngle * damping));
    actor.viewVector.z = Math.sin(viewVectorAngle - (actor.changedViewAngle * damping));
  }

  const inputComponent = getComponent(entity, Input) as Input;
  const followCamera = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent) as FollowCameraComponent;
  if(followCamera) {
    
    // this is for future integration of MMO style pointer lock controls
    // let inputAxes;
    // if (cameraFollow.mode === CameraModes.FirstPerson || cameraFollow.mode === CameraModes.ShoulderCam) {
    //   inputAxes = BaseInput.MOUSE_MOVEMENT;
    // } else {
      const inputAxes = BaseInput.LOOKTURN_PLAYERONE;
    // }
    const { inputValue, currentInputValue } = getInputData(inputComponent, inputAxes, prevState);
    prevState = currentInputValue;

    if(followCamera.locked && actor) {
      followCamera.theta = Math.atan2(actor.orientation.x, actor.orientation.z) * 180 / Math.PI + 180
    } else if (followCamera.locked) { // this is for cars
      followCamera.theta = Math.atan2(actorTransform.rotation.z, actorTransform.rotation.x) * 180 / Math.PI
    }

    followCamera.theta -= inputValue[0] * (isMobileOrTablet() ? 60 : 100);
    followCamera.theta %= 360;

    followCamera.phi -= inputValue[1] * (isMobileOrTablet() ? 60 : 100);
    followCamera.phi = Math.min(85, Math.max(-70, followCamera.phi));

    if(followCamera.locked || followCamera.mode === CameraModes.FirstPerson || followCamera.mode === CameraModes.XR) {
      actorTransform.rotation.setFromAxisAngle(upVector, (followCamera.theta - 180) * (Math.PI / 180));
      actor.orientation.copy(forwardVector).applyQuaternion(actorTransform.rotation);
      actorTransform.rotation.setFromUnitVectors(forwardVector, actor.orientation.clone().setY(0));
    }
  }
  
  // if(WebXRRendererSystem.instance?.cameraDolly) WebXRRendererSystem.instance.cameraDolly.setRotationFromAxisAngle(downVector, Math.atan2(actor.viewVector.z, actor.viewVector.x))
  
	const flatViewVector = new Vector3(actor.viewVector.x, 0, actor.viewVector.z).normalize();
	const moveVector = localMovementDirection.length() ? applyVectorMatrixXZ(flatViewVector, forwardVector) : emptyVector.setScalar(0);

	if (followCamera && (followCamera.mode === CameraModes.FirstPerson || followCamera.mode === CameraModes.XR))
		actor.orientationTarget.copy(new Vector3().copy(actor.orientation).setY(0).normalize());
	else if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0)
		actor.orientationTarget.copy(new Vector3().copy(actor.orientation).setY(0).normalize());
	else
		actor.orientationTarget.copy(new Vector3().copy(moveVector).setY(0).normalize());
};


const {
  IDLE,
  WALK_FORWARD, WALK_BACKWARD, WALK_STRAFE_LEFT, WALK_STRAFE_RIGHT,
  RUN_FORWARD, RUN_BACKWARD, RUN_STRAFE_LEFT, RUN_STRAFE_RIGHT, JUMP, FALLING, DROP, DROP_ROLLING
} = CharacterAnimations;

const animationsSchema = [
  {
    type: [IDLE], name: 'idle', axis: 'xyz', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ -0.5, 0, 0.5 ],
    weight:     [  0 , 1.4, 0  ],
    dontHasHit: [  0 ,  0,  0  ]
  },{
    type: [FALLING], name: 'falling', axis:'xyz', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ -1,   0,   1 ],
    weight:     [  0 ,  0,   0 ],
    dontHasHit: [  1 ,  1,   1 ]
  },
  {
    type: [DROP], name: 'falling_to_land', axis:'y', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [  -1,   0  ],
    weight:     [   1,   0  ],
    dontHasHit: [   1,   0  ]
  },
  /*
  {
    type: [DROP_ROLLING], name: 'falling_to_roll', axis:'z', speed: 1, customProperties: ['weight', 'dontHasHit'],
    value:      [  0,   1 ],
    weight:     [  0,   0 ],
    dontHasHit: [  0,   1 ]
  },
  */
  {
    type: [WALK_FORWARD], name: 'walking', axis:'z', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ 0.1, 0.5, 1 ],
    weight:     [  0,   1,  0 ],
    dontHasHit: [  0,   0,  0 ]
  },{
    type: [WALK_STRAFE_RIGHT], name: 'walk_right', axis:'x', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ -1, -0.5, -0.1 ],
    weight:     [  0,   1 ,   0  ],
    dontHasHit: [  0 ,  0,    0  ]
  },{
    type: [WALK_STRAFE_LEFT], name: 'walk_left', axis:'x', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ 0.1, 0.5, 1 ],
    weight:     [  0,   1,  0 ],
    dontHasHit: [  0 ,  0,  0 ]
  },{
    type: [WALK_BACKWARD], name: 'walking_backward', axis:'z', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ -1, -0.5, -0.1],
    weight:     [  0,   1,    0 ],
    dontHasHit: [  0 ,  0,    0 ]
  },

  {
    type: [RUN_FORWARD], name: 'run_forward', axis:'z', speed: 0.45, customProperties: ['weight', 'dontHasHit'],
    value:      [  0.5,  1  ],
    weight:     [   0,   1  ],
    dontHasHit: [   0 , 0.5 ]
  },{
    type: [RUN_STRAFE_RIGHT], name: 'run_right', axis: 'x', speed: 0.45, customProperties: ['weight', 'dontHasHit'],
    value:      [ -1, -0.5 ],
    weight:     [  1 ,  0  ],
    dontHasHit: [  0.5, 0  ]
  },{
    type: [RUN_STRAFE_LEFT], name: 'run_left', axis:'x', speed: 0.45, customProperties: ['weight', 'dontHasHit'],
    value:      [ 0.5,  1  ],
    weight:     [  0 ,  1  ],
    dontHasHit: [  0 , 0.5 ]
  },{
    type: [RUN_BACKWARD], name: 'run_backward', axis: 'z', speed: 0.45, customProperties: ['weight', 'dontHasHit'],
    value:      [ -1 ,-0.5 ],
    weight:     [  1 ,  0  ],
    dontHasHit: [ 0.5,  0  ]
  }
];





const initializeCharacterState: Behavior = (entity, args: { x?: number, y?: number, z?: number }) => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if (!actor.initialized) return;

	if (actor.velocitySimulator === undefined ) {
		actor.velocitySimulator.init();
	}
  if ((actor as any).vactorAnimSimulator === undefined ) {
    (actor as any).vactorAnimSimulator.init();
  }
  if (actor.moveVectorSmooth === undefined ) {
    actor.moveVectorSmooth.init();
  }

	actor.velocitySimulator.damping = actor.defaultVelocitySimulatorDamping;
	actor.velocitySimulator.mass = actor.defaultVelocitySimulatorMass;

  (actor as any).vactorAnimSimulator.damping = 0.5;
	(actor as any).vactorAnimSimulator.mass = 35;

  actor.moveVectorSmooth.damping = 0.7;
	actor.moveVectorSmooth.mass = 35;

	actor.rotationSimulator.damping = actor.defaultRotationSimulatorDamping;
	actor.rotationSimulator.mass = actor.defaultRotationSimulatorMass;

	actor.canEnterVehicles = false;
	actor.canLeaveVehicles = true;

  actor.canFindVehiclesToEnter = true;

	actor.arcadeVelocityIsAdditive = false;
	actor.arcadeVelocityInfluence.set(1, 0, 1);

	actor.timer = 0;
	actor.velocityTarget.z = args?.z ?? 0;
	actor.velocityTarget.x = args?.x ?? 0;
	actor.velocityTarget.y = args?.y ?? 0;
};

/*
export const onAnimationEnded: Behavior = (entity: Entity, args: { transitionToState: any }, deltaTime) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return console.warn("Actor not initialized");
  if (actor.timer > actor.currentAnimationLength - deltaTime) {
  //  console.log('animation ended! (', actor.currentAnimationLength, ')', now(),', switch to ', args.transitionToState)
    setState(entity, { state: args.transitionToState });
  }
};
*/
const customVector = new Vector3(0,0,0);
const getMovementValues: Behavior = (entity, args: {}, deltaTime: number) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  // simulate rayCastHit as vectorY from 1 to 0, for smooth changes
 //  absSpeed = MathUtils.smoothstep(absSpeed, 0, 1);
  actor.moveVectorSmooth.target.copy(actor.animationVelocity);
  actor.moveVectorSmooth.simulate(deltaTime);
  const actorVelocity = actor.moveVectorSmooth.position;

  customVector.setY(actor.rayHasHit ? 0 : 1);
  (actor as any).vactorAnimSimulator.target.copy(customVector);
  (actor as any).vactorAnimSimulator.simulate(deltaTime);
  let dontHasHit = (actor as any).vactorAnimSimulator.position.y;

  dontHasHit < 0.00001 ? dontHasHit = 0:'';
  dontHasHit = Math.min(dontHasHit, 1);

  return { actorVelocity, dontHasHit };
}


export const MovingState: StateSchemaValue = {
  componentProperties: [{
    component: CharacterComponent,
    properties: {
      ['canEnterVehicles']: true,
   // jump and hit
    }
  }],
  onEntry: [
    {
      behavior: initializeCharacterState,
    },
    {
      behavior: clearAnimOnChange,
      args: {
        animationsSchema: animationsSchema
      }
    }
  ],
  onUpdate: [
    {
      behavior: updateCharacterState // rotation character
    },
    {
      behavior: physicsMove
    },
    {
      behavior: updateVectorAnimation,
      args: {
        animationsSchema: animationsSchema, // animationsSchema
        updateAnimationsValues: getMovementValues // function
      }
    }
  ]
};
