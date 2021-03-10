import { isClient } from "../../common/functions/isClient";
import { isServer } from "../../common/functions/isServer";
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';
import { Network } from '../../networking/classes/Network';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { CapsuleCollider } from '../components/CapsuleCollider';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { TransformComponent } from '../../transform/components/TransformComponent';

const snapshotX = 0;
export const capsuleColliderBehavior: Behavior = (entity: Entity, args): void => {

  if (args.phase == 'onUpdate') {

      if (isClient && hasComponent(entity, LocalInputReceiver) && hasComponent(entity, NetworkObject)) {

        const actor = getComponent(entity, CharacterComponent)
        const networkId = Network.instance.localAvatarNetworkId;
        const correction = args.clientSnapshot.correction;

        if (hasComponent(entity, LocalInputReceiver)) {
          args.clientSnapshot.new.push({
               networkId: networkId,
               x: actor.actorCapsule.body.position.x,
               y: actor.actorCapsule.body.position.y,
               z: actor.actorCapsule.body.position.z,
               qX: actor.actorCapsule.body.quaternion.x,
               qY: actor.actorCapsule.body.quaternion.y,
               qZ: actor.actorCapsule.body.quaternion.z,
               qW: actor.actorCapsule.body.quaternion.w
             })
        } else {
          // dont update interpolation when in car
          return;
        }

        let offsetX = 0, offsetY = 0, offsetZ = 0;

        if (args.clientSnapshot.old && Network.instance.snapshot ) {
         const clientSnapshotPos = args.clientSnapshot.old.state.find(v => v.networkId == networkId);
         const snapshot = Network.instance.snapshot.state.find(v => v.networkId == networkId);


         if (clientSnapshotPos && snapshot) {

           offsetX = clientSnapshotPos.x - snapshot.x;
           offsetY = clientSnapshotPos.y - snapshot.y;
           offsetZ = clientSnapshotPos.z - snapshot.z;


          if (Math.abs(offsetX) + Math.abs(offsetY) + Math.abs(offsetZ) > 3) {
            actor.actorCapsule.body.position.x = snapshot.x;
            actor.actorCapsule.body.position.y = snapshot.y;
            actor.actorCapsule.body.position.z = snapshot.z;
          } else {
            actor.actorCapsule.body.position.x -= (offsetX / correction);
            actor.actorCapsule.body.position.y -= (offsetY / correction);
            actor.actorCapsule.body.position.z -= (offsetZ / correction);
          }

         }
       }

     } else if (isClient && hasComponent(entity, CharacterComponent) && args.clientSnapshot.interpolationSnapshot ) { //

       const actor = getComponent<CharacterComponent>(entity, CharacterComponent)
       const actorTransform = getMutableComponent<TransformComponent>(entity, TransformComponent as any);
       const networkObject = getComponent<NetworkObject>(entity, NetworkObject)

       const snapshot = args.clientSnapshot.interpolationSnapshot.state.find(v => v.networkId == networkObject.networkId);
       //const snapshot = Network.instance.snapshot.state.find(v => v.networkId == networkObject.networkId);

       if (snapshot) {

         actor.actorCapsule.body.position.x = snapshot.x;
         actor.actorCapsule.body.position.y = snapshot.y;
         actor.actorCapsule.body.position.z = snapshot.z;


         actorTransform.position.x = snapshot.x;
         actorTransform.position.y = snapshot.y;
         actorTransform.position.z = snapshot.z;

       }
     } else if (isServer) {

     }

  } else if (args.phase == 'onRemoved') {
    const capsule = getComponent<CapsuleCollider>(entity, CapsuleCollider, true);
    if (capsule) {
      PhysicsSystem.physicsWorld.removeBody(capsule.body);
    }
  }
};
