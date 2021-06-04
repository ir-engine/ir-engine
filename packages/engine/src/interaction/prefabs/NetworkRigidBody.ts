import { Entity } from '../../ecs/classes/Entity';
import { NetworkPrefab } from '../../networking/interfaces/NetworkPrefab';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../../physics/components/ColliderComponent';
import { RigidBodyComponent } from '../../physics/components/RigidBody';
import { initializeNetworkObject } from '../../networking/functions/initializeNetworkObject';
import { PrefabType } from '../../networking/templates/PrefabType';
import { isClient } from '../../common/functions/isClient';
import { Network } from '../../networking/classes/Network';
import { InterpolationComponent } from '../../physics/components/InterpolationComponent';
import { InterpolationInterface } from '../../physics/interfaces/InterpolationInterface';
import { rigidbodyInterpolationBehavior } from '../../physics/behaviors/rigidbodyInterpolationBehavior';
import { rigidbodyCorrectionBehavior } from '../../physics/behaviors/rigidbodyCorrectionBehavior';

/**
* @author HydraFire <github.com/HydraFire>
 */

export function createNetworkRigidBody( args:{ parameters?: any, networkId?: number, uniqueId: string, entity?: Entity, ownerId?: string }) {
  const networkComponent = initializeNetworkObject({
    entity: args.entity,
    prefabType: PrefabType.RigidBody,
    uniqueId: args.uniqueId,
    ownerId: args.ownerId,
    override: {
      networkComponents: [
        {
          type: ColliderComponent,
          data: {
            body: args.parameters.body,
            bodytype:  args.parameters.bodytype,
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
  if (!isClient) {
    Network.instance.worldState.createObjects.push({
        networkId: networkComponent.networkId,
        ownerId: networkComponent.ownerId,
        prefabType: PrefabType.RigidBody,
        uniqueId: networkComponent.uniqueId,
        parameters: ''
    });
  }
}

export const characterInterpolationSchema: InterpolationInterface = {
	interpolationBehavior: rigidbodyInterpolationBehavior,
	serverCorrectionBehavior: rigidbodyCorrectionBehavior
}

// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkRigidBody: NetworkPrefab = {
  initialize: createNetworkRigidBody,
  // These will be created for all players on the network
  networkComponents: [
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    { type: ColliderComponent },
    { type: RigidBodyComponent }
    // Local player input mapped to behaviors in the input map
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [],
  clientComponents: [
		{ type: InterpolationComponent, data: { schema: characterInterpolationSchema } },
  ],
  serverComponents: [],
  onAfterCreate: [],
  onBeforeDestroy: []
};
