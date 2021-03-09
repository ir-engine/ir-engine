import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';

import { CapsuleCollider } from '../components/CapsuleCollider';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';

export const physicsJump: Behavior = (entity: Entity, args: any): void => {
  console.warn('jump');
  // Physically jump
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  if(!actor.initialized) return;

  const capsule = getMutableComponent<CapsuleCollider>(entity, CapsuleCollider);
  const body = capsule.body;

  //  actor.arcadeVelocityIsAdditive = true;
//    actor.wantsToJump = false;
  if (actor.rayHasHit ) { //!actor.alreadyJumped
  //  actor.alreadyJumped = true;
    actor.rotationSimulator.damping = 0.3;
    actor.initJumpSpeed = 1;
  //  actor.arcadeVelocityIsAdditive = true;
    // Add positive vertical velocity
    body.velocity.y += 4;
    // Move above ground by 2x safe offset value
    body.position.y += actor.raySafeOffset * 2;
  }

  // Jumping
//  if (actor.wantsToJump) {
    // If initJumpSpeed is set

      // Flatten velocity
    //	body.velocity.y = 0;
    //	const speed = 0.1
  //		body.velocity = cannonFromThreeVector(actor.orientation.clone().multiplyScalar(speed));
  //		console.warn(body.velocity);


      // Moving objects compensation
  //    const add = new Vec3();
  //    actor.rayResult.body.getVelocityAtWorldPoint(actor.rayResult.hitPointWorld, add);
  //    body.velocity.vsub(add, body.velocity);
  //  }



};
