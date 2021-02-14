import { isClient } from "../../common/functions/isClient";
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { CapsuleCollider } from '../components/CapsuleCollider';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { TransformComponent } from '../../transform/components/TransformComponent';

export const capsuleColliderBehavior: Behavior = (entity: Entity, args): void => {

  if (args.phase == 'onUpdate') {

      if (isClient && hasComponent(entity, LocalInputReceiver) && hasComponent(entity, NetworkObject)) {

        const actor = getComponent(entity, CharacterComponent)
        const networkObject = getComponent(entity, NetworkObject)
        const correction = args.clientSnapshot.correction;

        args.clientSnapshot.new.push({
             networkId: networkObject.networkId,
             x: actor.actorCapsule.body.position.x,
             y: actor.actorCapsule.body.position.y,
             z: actor.actorCapsule.body.position.z,
             qX: actor.actorCapsule.body.quaternion.x,
             qY: actor.actorCapsule.body.quaternion.y,
             qZ: actor.actorCapsule.body.quaternion.z,
             qW: actor.actorCapsule.body.quaternion.w
           })

        let offsetX = 0, offsetY = 0, offsetZ = 0;

        if (args.clientSnapshot.old && args.clientSnapshot.interpolationSnapshot) {
         const clientSnapshotPos = args.clientSnapshot.old.state.find(v => v.networkId == networkObject.networkId);
         const interpolationSnapshot = args.clientSnapshot.interpolationSnapshot.state.find(v => v.networkId == networkObject.networkId);
      //   const serverSnapshotPos = Network.instance.snapshot.state.find(v => v.networkId == networkObject.networkId);

         if (clientSnapshotPos && interpolationSnapshot) {

           offsetX = clientSnapshotPos.x - interpolationSnapshot.x;
           offsetY = clientSnapshotPos.y - interpolationSnapshot.y;
           offsetZ = clientSnapshotPos.z - interpolationSnapshot.z;


          if (Math.abs(offsetX) + Math.abs(offsetY) + Math.abs(offsetZ) > 3) {
            actor.actorCapsule.body.position.x = interpolationSnapshot.x;
            actor.actorCapsule.body.position.y = interpolationSnapshot.y;
            actor.actorCapsule.body.position.z = interpolationSnapshot.z;
          } else {
            actor.actorCapsule.body.position.x -= (offsetX / correction);
            actor.actorCapsule.body.position.y -= (offsetY / correction);
            actor.actorCapsule.body.position.z -= (offsetZ / correction);
          }

         }
       }

     } else if (isClient && hasComponent(entity, CharacterComponent) && args.clientSnapshot.interpolationSnapshot) {

       const actor = getComponent<CharacterComponent>(entity, CharacterComponent)
       const actorTransform = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
       const networkObject = getComponent<NetworkObject>(entity, NetworkObject)

       const interpolationSnapshot = args.clientSnapshot.interpolationSnapshot.state.find(v => v.networkId == networkObject.networkId);
    //  const serverSnapshotPos = Network.instance.snapshot.state.find(v => v.networkId == networkObject.networkId);

       if (interpolationSnapshot) {

         actor.actorCapsule.body.position.x = interpolationSnapshot.x;
         actor.actorCapsule.body.position.y = interpolationSnapshot.y;
         actor.actorCapsule.body.position.z = interpolationSnapshot.z;


        actorTransform.position.x = interpolationSnapshot.x;
        actorTransform.position.y = interpolationSnapshot.y;
        actorTransform.position.z = interpolationSnapshot.z;

       }
     }

  } else if (args.phase == 'onRemoved') {
    const capsule = getComponent<CapsuleCollider>(entity, CapsuleCollider, true);
    if (capsule) {
      PhysicsSystem.physicsWorld.removeBody(capsule.body);
    }
  }
};
