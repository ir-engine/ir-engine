import { getComponent, getMutableComponent } from "@xr3ngine/engine/src/ecs/functions/EntityFunctions";
import { Entity } from '../../ecs/classes/Entity';
import { Network } from '../../networking/classes/Network';
import { NetworkPrefab } from '../../networking/interfaces/NetworkPrefab';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '@xr3ngine/engine/src/physics/components/ColliderComponent';
import { RigidBody } from '@xr3ngine/engine/src/physics/components/RigidBody';
import { InterpolationComponent } from "@xr3ngine/engine/src/physics/components/InterpolationComponent";
import { AssetLoader } from '../../assets/components/AssetLoader';
import { initializeNetworkObject } from '../../networking/functions/initializeNetworkObject';
import { PrefabType } from "@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema";
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';


export function createNetworkRigidBody( args:{ parameters?: any, networkId?: string | number, uniqueId: string, entity?: Entity }) {
  if (args.parameters === undefined) {

    Network.instance.networkObjects[args.networkId] = {
      ownerId: 'server',
      prefabType: PrefabType.RigidBody,
      component: null,
      uniqueId: args.uniqueId
    };

  } else {

    initializeNetworkObject({
      entity: args.entity,
      prefabType: PrefabType.RigidBody,
      uniqueId: args.uniqueId,
      override: {
        networkComponents: [
          {
            type: ColliderComponent,
            data: {
              type: args.parameters.type,
              position: args.parameters.position,
              quaternion: args.parameters.quaternion,
              scale: args.parameters.scale,
              mesh: args.parameters.mesh,
              vertices: args.parameters.vertices,
              indices: args.parameters.indices,
              mass: args.parameters.mass
            }
          }
        ]
      }
    });

  }
}
// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkRigidBody: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    { type: ColliderComponent },
    { type: RigidBody }
    // Local player input mapped to behaviors in the input map
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [],
  clientComponents: [
    { type: InterpolationComponent }
  ],
  serverComponents: [],
  onAfterCreate: [],
  onBeforeDestroy: []
};
