import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, createEntity, addComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from '../../physics/components/ColliderComponent';
import { RigidBody } from '../../physics/components/RigidBody';
import { addColliderWithoutEntity } from '../../physics/behaviors/addColliderWithoutEntity';
/*
import { Vector3 } from 'three';
import { PrefabType } from "@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema";
import { Network } from "@xr3ngine/engine/src/networking/components/Network";
import { initializeNetworkObject } from '@xr3ngine/engine/src/networking/functions/initializeNetworkObject';
import { isServer } from '../../common/functions/isServer';
*/

/*
function test() {
  const userId = 'server';
   const networkObject2 = initializeNetworkObject(userId, Network.getNetworkId(), PrefabType.worldObject);
   const transform2 = getComponent(networkObject2.entity, TransformComponent);

   // Add the network object to our list of network objects
   Network.instance.networkObjects[networkObject2.networkId] = {
       ownerId: userId, // Owner's socket ID
       prefabType: PrefabType.worldObject, // All network objects need to be a registered prefab
       component: networkObject2
   };

   // Added new object to the worldState with networkId and ownerId
   Network.instance.createObjects.push({
       networkId: networkObject2.networkId,
       ownerId: userId,
       prefabType: PrefabType.worldObject,
       x: transform2.position.x,
       y: transform2.position.y,
       z: transform2.position.z,
       qX: transform2.rotation.x,
       qY: transform2.rotation.y,
       qZ: transform2.rotation.z,
       qW: transform2.rotation.w
   });
}
*/
export const createBoxCollider: Behavior = (entity, args: any) => {
  // addComponent(entity, ColliderComponent, args.objArgs);
  addColliderWithoutEntity(args.objArgs.type, args.objArgs.position, args.objArgs.quaternion, args.objArgs.scale, args.objArgs.mesh);
  /*
     if (isServer) {
       for (let i = 0; i < 50; i++) {
         test()
       }
     }
     */
};
