import { Vec3 } from 'cannon-es';
import { isClient } from '../../common/functions/isClient';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { CapsuleCollider } from '../components/CapsuleCollider';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { CollisionGroups } from '../enums/CollisionGroups';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
//import { useRouter } from 'next/router';



export const capsuleColliderBehavior: Behavior = (entity: Entity, args): void => {
  const capsule = getMutableComponent<CapsuleCollider>(entity, CapsuleCollider)
  const transform = getComponent<TransformComponent>(entity, TransformComponent as any);
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  if (args.phase == 'onAdded') {
/*
    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent)
    const actorTransform = getMutableComponent<TransformComponent>(entity, TransformComponent as any);

   if(isNaN( actor.actorCapsule.body.position.x) || isNaN( actor.actorCapsule.body.position.y)) {
     actor.actorCapsule.body.position = cannonFromThreeVector(actorTransform.position);
   }
*/
    return;
  }

  if (args.phase == 'onRemoved') {
    const removedCapsule = getComponent<CapsuleCollider>(entity, CapsuleCollider, true);
    if (removedCapsule) {
      PhysicsSystem.physicsWorld.removeBody(removedCapsule.body);
    }
    return;
  }

  if (actor == undefined || !actor.initialized) return;

  if(isNaN(capsule.body.position.x)) {
    capsule.body.position.x = 0;
    capsule.body.position.y = 0;
    capsule.body.position.z = 0;
  }
  // onUpdate
  transform.position.set(
    capsule.body.position.x,
    capsule.body.position.y,
    capsule.body.position.z
  );

  // Shearch ground
  // Create ray

  // Raycast options
  const rayDontStuckOptions = {
  	collisionFilterMask: CollisionGroups.Default | CollisionGroups.Car,
  	skipBackfaces: true /* ignore back faces */
  };

  const actorRaycastOptions = {
  	collisionFilterMask: CollisionGroups.Default | CollisionGroups.Car | CollisionGroups.ActiveCollider,
  	skipBackfaces: true /* ignore back faces */
  };

  let n = 0.17;

  const actorRaycastStart = new Vec3(capsule.body.position.x, capsule.body.position.y, capsule.body.position.z);
  const actorRaycastEnd = new Vec3(capsule.body.position.x, capsule.body.position.y - actor.rayCastLength - actor.raySafeOffset, capsule.body.position.z);

  const actorRaycastStart0 = new Vec3(capsule.body.position.x + n, capsule.body.position.y, capsule.body.position.z);
  const actorRaycastEnd0 = new Vec3(capsule.body.position.x + n, capsule.body.position.y - actor.rayCastLength - actor.raySafeOffset, capsule.body.position.z);

  const actorRaycastStart1 = new Vec3(capsule.body.position.x, capsule.body.position.y, capsule.body.position.z + n);
  const actorRaycastEnd1 = new Vec3(capsule.body.position.x, capsule.body.position.y - actor.rayCastLength - actor.raySafeOffset, capsule.body.position.z+n);

  const actorRaycastStart2 = new Vec3(capsule.body.position.x-n, capsule.body.position.y, capsule.body.position.z);
  const actorRaycastEnd2 = new Vec3(capsule.body.position.x-n, capsule.body.position.y - actor.rayCastLength - actor.raySafeOffset, capsule.body.position.z);

  const actorRaycastStart3 = new Vec3(capsule.body.position.x, capsule.body.position.y, capsule.body.position.z-n);
  const actorRaycastEnd3 = new Vec3(capsule.body.position.x, capsule.body.position.y - actor.rayCastLength - actor.raySafeOffset, capsule.body.position.z-n);

  let m = PhysicsSystem.physicsWorld.raycastClosest(actorRaycastStart, actorRaycastEnd, actorRaycastOptions, actor.rayResult);
  let m0 = PhysicsSystem.physicsWorld.raycastClosest(actorRaycastStart0, actorRaycastEnd0, rayDontStuckOptions, actor.rayDontStuckX);
  let m1 = PhysicsSystem.physicsWorld.raycastClosest(actorRaycastStart1, actorRaycastEnd1, rayDontStuckOptions, actor.rayDontStuckZ);
  let m2 = PhysicsSystem.physicsWorld.raycastClosest(actorRaycastStart2, actorRaycastEnd2, rayDontStuckOptions, actor.rayDontStuckXm);
  let m3 = PhysicsSystem.physicsWorld.raycastClosest(actorRaycastStart3, actorRaycastEnd3, rayDontStuckOptions, actor.rayDontStuckZm);
  // Cast the ray
  actor.rayHasHit = m0 || m1 || m2 || m3;

  if (actor.rayHasHit) {
    const arrT = [actor.rayDontStuckX.hitPointWorld.y,
     actor.rayDontStuckZ.hitPointWorld.y,
     actor.rayDontStuckXm.hitPointWorld.y,
     actor.rayDontStuckZm.hitPointWorld.y]
     actor.rayGroundY = arrT.sort()[0]

    if (capsule.playerStuck < 180) {
      capsule.playerStuck = 0;
    }
  } else {
    capsule.playerStuck += 1;
  }

  if (isClient && m && actor.rayResult.body.collisionFilterGroup == CollisionGroups.ActiveCollider) {
    actor.playerInPortal += 1
    if (actor.playerInPortal > 120) {
      //@ts-ignore
      EngineEvents.instance.dispatchEvent({ type: PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT, location: actor.rayResult.body.link });
      actor.playerInPortal = 0;
    }
  } else {
    actor.playerInPortal = 0;
  }

  actor.rayGroundHit = m;
	// Raycast debug
	// if (actor.rayHasHit) {
	// 	if (actor.raycastBox.visible) {
	// 		actor.raycastBox.position.x = actor.rayResult.hitPointWorld.x;
	// 		actor.raycastBox.position.y = actor.rayResult.hitPointWorld.y;
	// 		actor.raycastBox.position.z = actor.rayResult.hitPointWorld.z;
	// 	}
	// }
	// else {
	// 	if (actor.raycastBox.visible) {
	// 		actor.raycastBox.position.set(body.position.x, body.position.y - actor.rayCastLength - actor.raySafeOffset, body.position.z);
	// 	}
	// }
};
