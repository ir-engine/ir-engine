import { Vec3 } from 'cannon-es';
import { Euler, Matrix4, Vector3, Quaternion } from 'three';
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

const lastPos = { x:0, y:0, z:0 };
export const updateVelocityVector: Behavior = (entity: Entity, args): void => {
  if (hasComponent(entity, CapsuleCollider)) {
    const capsule = getComponent<CapsuleCollider>(entity, CapsuleCollider);
    const transform = getComponent<TransformComponent>(entity, TransformComponent);
    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
    if (!actor.initialized) return;

    const x = capsule.body.position.x - lastPos.x;
    const y = capsule.body.position.y - lastPos.y;
    const z = capsule.body.position.z - lastPos.z;

    if(isNaN(x)) {
      actor.animationVelocity = new Vector3(0,1,0);
      return;
    }

    lastPos.x = capsule.body.position.x;
    lastPos.y = capsule.body.position.y;
    lastPos.z = capsule.body.position.z;

    const q = new Quaternion().copy(transform.rotation).invert();
    actor.animationVelocity = new Vector3(x,y,z).applyQuaternion(q);
  }
};

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
    capsule.playerStuck = 1000;
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

  const n = 0.17;

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

  const m = PhysicsSystem.physicsWorld.raycastClosest(actorRaycastStart, actorRaycastEnd, actorRaycastOptions, actor.rayResult);
  const m0 = PhysicsSystem.physicsWorld.raycastClosest(actorRaycastStart0, actorRaycastEnd0, rayDontStuckOptions, actor.rayDontStuckX);
  const m1 = PhysicsSystem.physicsWorld.raycastClosest(actorRaycastStart1, actorRaycastEnd1, rayDontStuckOptions, actor.rayDontStuckZ);
  const m2 = PhysicsSystem.physicsWorld.raycastClosest(actorRaycastStart2, actorRaycastEnd2, rayDontStuckOptions, actor.rayDontStuckXm);
  const m3 = PhysicsSystem.physicsWorld.raycastClosest(actorRaycastStart3, actorRaycastEnd3, rayDontStuckOptions, actor.rayDontStuckZm);
  // Cast the ray
  actor.rayGroundHit = m;
  actor.rayHasHit = m0 || m1 || m2 || m3;

  if (actor.rayHasHit) {
    const arrT = []
    actor.rayDontStuckX.shape != null ? arrT.push(actor.rayDontStuckX.hitPointWorld.y):'';
    actor.rayDontStuckZ.shape != null ? arrT.push(actor.rayDontStuckZ.hitPointWorld.y) :'';
    actor.rayDontStuckXm.shape != null ? arrT.push(actor.rayDontStuckXm.hitPointWorld.y) :'';
    actor.rayDontStuckZm.shape != null ? arrT.push(actor.rayDontStuckZm.hitPointWorld.y) :'';
    actor.rayGroundY = arrT.sort((a, b) => b - a)[0];
    if (capsule.playerStuck > 10) {
      capsule.playerStuck = 0;
    }
  } else {
    capsule.playerStuck += 1;
  }
 // its for portals for time
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
