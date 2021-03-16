import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { StateSchemaValue } from '../../../state/interfaces/StateSchema';
import { physicsMove } from '../../../physics/behaviors/physicsMove';
import { triggerActionIfMovementHasChanged } from '../behaviors/triggerActionIfMovementHasChanged';
import { updateCharacterState } from "../behaviors/updateCharacterState";
import { CharacterStateTypes } from '../CharacterStateTypes';
import { CharacterComponent } from '../components/CharacterComponent';
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
    type: [IDLE], name: 'idle', axis: 'xyz', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ -0.5, 0, 0.5 ],
    weight:     [  0 , 1.4,  0  ],
    dontHasHit: [  0 ,  0,  0  ]
  },{
    type: [FALLING], name: 'falling', axis:'xyz', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ -1,   0,   1 ],
    weight:     [  0 ,  0,   0 ],
    dontHasHit: [  1 ,  1,   1 ]
  },
  {
    type: [DROP], name: 'falling_to_land', axis:'y', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [  -1  ,   0  ],
    weight:     [   1 ,    0  ],
    dontHasHit: [   1  ,   0  ]
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
    weight:     [ 0,  1,  0 ],
    dontHasHit: [ 0,  0,  0 ]
  },{
    type: [WALK_STRAFE_RIGHT], name: 'walk_right', axis:'x', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ -1, -0.5, -0.1 ],
    weight:     [  0,   1 , 0 ],
    dontHasHit: [  0 ,  0,  0 ]
  },{
    type: [WALK_STRAFE_LEFT], name: 'walk_left', axis:'x', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ 0.1,  0.5, 1 ],
    weight:     [ 0,   1,  0 ],
    dontHasHit: [ 0 ,  0,  0 ]
  },{
    type: [WALK_BACKWARD], name: 'walking_backward', axis:'z', speed: 0.5, customProperties: ['weight', 'dontHasHit'],
    value:      [ -1, -0.5, -0.1 ],
    weight:     [  0,   1 , 0 ],
    dontHasHit: [  0 ,  0,  0 ]
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
  if (actor.vactorAnimSimulator === undefined ) {
    actor.vactorAnimSimulator.init();
  }
  if (actor.moveVectorSmooth === undefined ) {
    actor.moveVectorSmooth.init();
  }

	actor.velocitySimulator.damping = actor.defaultVelocitySimulatorDamping;
	actor.velocitySimulator.mass = actor.defaultVelocitySimulatorMass;

  actor.vactorAnimSimulator.damping = 0.5;
	actor.vactorAnimSimulator.mass = 35;

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
  actor.vactorAnimSimulator.target.copy(customVector);
  actor.vactorAnimSimulator.simulate(deltaTime);
  let dontHasHit = actor.vactorAnimSimulator.position.y;

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
