import { Behavior } from '../../common/interfaces/Behavior';
import { Matrix4, Vector3, Quaternion } from 'three';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { CapsuleCollider } from '../components/CapsuleCollider';
import { Engine } from '../../ecs/classes/Engine';
import { TransformComponent } from '../../transform/components/TransformComponent';

let lastPos = { x:0, y:0, z:0 };
let correctionSpeed = 180;
export const serverCorrectionBehavior: Behavior = (entity: Entity, args): void => {

  if (hasComponent(entity, CapsuleCollider)) {
    const capsule = getComponent<CapsuleCollider>(entity, CapsuleCollider);
    const transform = getComponent<TransformComponent>(entity, TransformComponent);
    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
    if (!actor.initialized) return;

    let x = capsule.body.position.x - lastPos.x;
    let y = capsule.body.position.y - lastPos.y;
    let z = capsule.body.position.z - lastPos.z;
    if(isNaN(x)) {
      actor.animationVelocity = new Vector3(0,1,0);
      return;
    }
    actor.playerSpeedNow = Math.sqrt(x*x + y*y + z*z)*Engine.physicsFrameRate;
    lastPos.x = capsule.body.position.x;
    lastPos.y = capsule.body.position.y;
    lastPos.z = capsule.body.position.z;

    if (actor.playerSpeedNow < 0.001) {
      x = 0;
      y = 0;
      z = 0;
    }

    let q = new Quaternion().copy(transform.rotation).invert();
    actor.animationVelocity = new Vector3(x,y,z).normalize().applyQuaternion(q);
  }

  if (args.correction == null || args.snapshot == null) return;
/*
  if (hasComponent(entity, CapsuleCollider)) {
    const capsule = getComponent<CapsuleCollider>(entity, CapsuleCollider);
    const transform = getComponent<TransformComponent>(entity, TransformComponent);
    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
    if (!actor.initialized) return;

      correctionSpeed = 180 * (1 - actor.playerSpeedNow/5);

      const offsetX = args.correction.x - args.snapshot.x;
      const offsetY = args.correction.y - args.snapshot.y;
      const offsetZ = args.correction.z - args.snapshot.z;

      if (Math.abs(offsetX) + Math.abs(offsetY) + Math.abs(offsetZ) > 3) {
        capsule.body.position.set(
          args.snapshot.x,
          args.snapshot.y,
          args.snapshot.z
        );
      } else {
        capsule.body.position.set(
          capsule.body.position.x - (offsetX / correctionSpeed),
          capsule.body.position.y - (offsetY / correctionSpeed),
          capsule.body.position.z - (offsetZ / correctionSpeed)
        );
      }
  }
*/
};

export const createNewCorrection: Behavior = (entity: Entity, args): void => {
  //
  if (hasComponent(entity, CapsuleCollider)) {
    const capsule = getComponent<CapsuleCollider>(entity, CapsuleCollider);
    args.state.push({
       networkId: args.networkId,
       x: capsule.body.position.x,
       y: capsule.body.position.y,
       z: capsule.body.position.z,
       qX: capsule.body.quaternion.x,
       qY: capsule.body.quaternion.y,
       qZ: capsule.body.quaternion.z,
       qW: capsule.body.quaternion.w
     })
   }
 //
};
