import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { physicsMove } from '../../../physics/behaviors/physicsMove';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent, RUN_SPEED, WALK_SPEED } from '../components/CharacterComponent';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { updateVectorAnimation, clearAnimOnChange, changeAnimation } from "../behaviors/updateVectorAnimation";
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { MathUtils, Vector3 } from "three";

import { isMyPlayer } from '../../../common/functions/isMyPlayer';
import { isOtherPlayer } from '../../../common/functions/isOtherPlayer';

const {
  IDLE,
  WALK_FORWARD, WALK_BACKWARD, WALK_STRAFE_LEFT, WALK_STRAFE_RIGHT,
  RUN_FORWARD, RUN_BACKWARD, RUN_STRAFE_LEFT, RUN_STRAFE_RIGHT, JUMP, FALLING, DROP, DROP_ROLLING
} = CharacterStateTypes;

const animationsSchema = [
  {
    type: [IDLE],
    name: 'idle', axis: 'xyz',
    value:  [ -0.5, 0, 0.5 ],
    weight: [  0 ,  1,   0 ],
    hitOff: [  0 ,  0,   0 ],
    speed: 2
  },{
    type: [FALLING],
    name: 'falling', axis:'y',
    value:  [ -1,   0,   1 ],
    weight: [  0 ,  0,   0 ],
    hitOff: [  1,   1,   1 ],
    speed: 1
  },

  {
    type: [DROP],
    name: 'falling_to_land', axis:'y',
    value:  [ -1,   0 ],
    weight: [  0.7 ,  0 ],
    speed: 0.7
  },

/*
  ,{
    type: [DROP_ROLLING],
    name: 'falling_to_roll', axis:'z',
    value:  [  0,   1 ],
    weight: [  0,   0 ],
    hitOff: [  1,   1 ],
    speed: 2
  },
*/
  {
    type: [WALK_FORWARD],
    name: 'walking', axis:'z',
    value:  [ 0, 0.5, 1 ],
    weight: [ 0,  1,  0 ],
    speed: 1
  },{
    type: [WALK_STRAFE_RIGHT],
    name: 'walk_right', axis:'x',
    value:  [ -1, -0.5, 0 ],
    weight: [  0,   1 , 0 ],
    speed: 1
  },{
    type: [WALK_STRAFE_LEFT],
    name: 'walk_left', axis:'x',
    value:  [ 0, 0.5,  1 ],
    weight: [ 0,  1,   0 ],
    speed: 1
  },{
    type: [WALK_BACKWARD],
    name: 'walking_backward', axis:'z',
    value:  [ -1, -0.5, 0 ],
    weight: [  0,   1 , 0 ],
    speed: 1
  },

  {
    type: [RUN_FORWARD],
    name: 'run_forward', axis:'z',
    value:  [  0.5,  1 ],
    weight: [   0,   1 ],
    speed: 0.9
  },{
    type: [RUN_STRAFE_RIGHT],
    name: 'run_right', axis: 'x',
    value:  [ -1, -0.5 ],
    weight: [  1 ,  0  ],
    speed: 0.9
  },{
    type: [RUN_STRAFE_LEFT],
    name: 'run_left', axis:'x',
    value:  [  0.5,  1 ],
    weight: [   0 ,  1 ],
    speed: 0.9
  },{
    type: [RUN_BACKWARD],
    name: 'run_backward', axis: 'z',
    value:  [ -1, -0.5 ],
    weight: [  1 ,  0 ],
    speed: 0.9
  }
];





const initializeCharacterState: Behavior = (entity, args: { x?: number, y?: number, z?: number }) => {
	const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
	if (!actor.initialized) return;

	if (actor.velocitySimulator === undefined ) {
		actor.velocitySimulator.init();
	}
  if (actor.vactorAnimSimulator === undefined ) {
    actor.vactorAnimSimulator.init();
  }
  if (actor.moveSpeedSmooth === undefined ) {
    actor.moveSpeedSmooth.init();
  }
  if (actor.moveVectorSmooth === undefined ) {
    actor.moveVectorSmooth.init();
  }

	actor.velocitySimulator.damping = actor.defaultVelocitySimulatorDamping;
	actor.velocitySimulator.mass = actor.defaultVelocitySimulatorMass;

  actor.vactorAnimSimulator.damping = 0.5;
	actor.vactorAnimSimulator.mass = 15;

  actor.moveVectorSmooth.damping = 0.5;
	actor.moveVectorSmooth.mass = 15;

	actor.rotationSimulator.damping = actor.defaultRotationSimulatorDamping;
	actor.rotationSimulator.mass = actor.defaultRotationSimulatorMass;

  actor.moveSpeedSmooth.damping = 0.7;
  actor.moveSpeedSmooth.mass = 35;


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
const customSpeed = new Vector3(0,0,0);
const getMovementValues: Behavior = (entity, args: {}, deltaTime: number) => {
  const actor = getComponent<CharacterComponent>(entity, CharacterComponent as any);
  const transform = getComponent(entity, TransformComponent);
  // actor.animationVelocity;
	let absSpeed = actor.playerSpeedNow;

  absSpeed = absSpeed / RUN_SPEED;

  // simulate rayCastHit as vectorY from 1 to 0, for smooth changes
//  absSpeed = MathUtils.smoothstep(absSpeed, 0, 1);

//customVector.setY(actor.rayHasHit ? 1 : 0);

actor.moveVectorSmooth.target.copy(actor.animationVelocity);
actor.moveVectorSmooth.simulate(deltaTime);
const actorVelocity = actor.moveVectorSmooth.position;
console.warn(actorVelocity.x, actorVelocity.z);
/*
  actor.moveSpeedSmooth.target = (absSpeed*100);
  actor.moveSpeedSmooth.simulate(deltaTime);
  absSpeed = (actor.moveSpeedSmooth.position/100);
*/



  customSpeed.setY(absSpeed);
  actor.moveSpeedSmooth.target.copy(customSpeed);
  actor.moveSpeedSmooth.simulate(deltaTime);
  absSpeed = actor.moveSpeedSmooth.position.y;

  customVector.setY(actor.rayHasHit ? 1 : 0);
  actor.vactorAnimSimulator.target.copy(customVector);
  actor.vactorAnimSimulator.simulate(deltaTime);
  const hitGround = actor.vactorAnimSimulator.position.y;

  absSpeed < 0.00001 && absSpeed > - 0.00001 ? absSpeed = 0:'';
  absSpeed = Math.min(absSpeed, 1);
  return { actorVelocity, absSpeed, hitGround };
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
