import { Quaternion } from 'three';
import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import { RigidBody } from '../components/RigidBody';
import { hasComponent, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Entity } from '../../ecs/classes/Entity';
import { isClient } from "../../common/functions/isClient";
import { Network } from '../../networking/components/Network';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { LocalInputReceiver } from '../../input/components/LocalInputReceiver';

export const capsuleColliderBehavior: Behavior = (entity: Entity, args): void => {

  if (args.phase == 'onUpdate') {

      if (isClient && hasComponent(entity, LocalInputReceiver) && hasComponent(entity, NetworkObject)) {

        const actor = getComponent<CharacterComponent>(entity, CharacterComponent)
        const networkObject = getComponent<NetworkObject>(entity, NetworkObject)
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
        let offsetqX = 0, offsetqY = 0, offsetqZ = 0, offsetqW = 0;

        if (args.clientSnapshot.old && Network.instance.worldState.snapshot) {
         const clientSnapshotPos = args.clientSnapshot.old.state.find(v => v.networkId == networkObject.networkId);
           //@ts-ignore
         const serverSnapshotPos = Network.instance.worldState.snapshot.state.find(v => v.networkId == networkObject.networkId);

         if (clientSnapshotPos && serverSnapshotPos) {

           offsetX = clientSnapshotPos.x - serverSnapshotPos.x;
           offsetY = clientSnapshotPos.y - serverSnapshotPos.y;
           offsetZ = clientSnapshotPos.z - serverSnapshotPos.z;
/*
           offsetqX = clientSnapshotPos.qX - serverSnapshotPos.qX;
           offsetqY = clientSnapshotPos.qY - serverSnapshotPos.qY;
           offsetqZ = clientSnapshotPos.qZ - serverSnapshotPos.qZ;
           offsetqZ = clientSnapshotPos.qW - serverSnapshotPos.qW;
*/
           actor.actorCapsule.body.position.x -= (offsetX / correction);
           actor.actorCapsule.body.position.y -= (offsetY / correction);
           actor.actorCapsule.body.position.z -= (offsetZ / correction);
/*
           actor.actorCapsule.body.quaternion.x = serverSnapshotPos.qX;
           actor.actorCapsule.body.quaternion.y = serverSnapshotPos.qY;
           actor.actorCapsule.body.quaternion.z = serverSnapshotPos.qZ;
           actor.actorCapsule.body.quaternion.w = serverSnapshotPos.qW;
           */
         }
       }

     } else if (isClient && hasComponent(entity, CharacterComponent) && args.clientSnapshot.interpolationSnapshot) {

       const actor = getComponent<CharacterComponent>(entity, CharacterComponent)
       const networkObject = getComponent<NetworkObject>(entity, NetworkObject)

       const interpolationSnapshot = args.clientSnapshot.interpolationSnapshot.state.find(v => v.networkId == networkObject.networkId);

       if (interpolationSnapshot) {
        actor.actorCapsule.body.position.x = interpolationSnapshot.x;
        actor.actorCapsule.body.position.y = interpolationSnapshot.y;
        actor.actorCapsule.body.position.z = interpolationSnapshot.z;
/*
        actor.actorCapsule.body.quaternion.x = interpolationSnapshot.qX;
        actor.actorCapsule.body.quaternion.y = interpolationSnapshot.qY;
        actor.actorCapsule.body.quaternion.z = interpolationSnapshot.qZ;
        actor.actorCapsule.body.quaternion.w = interpolationSnapshot.qW;
        */
       }
     }

  } else if (args.phase == 'onRemoved') {

  }
};
