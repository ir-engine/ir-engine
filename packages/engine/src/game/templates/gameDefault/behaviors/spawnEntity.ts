import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { initializeNetworkObject } from '../../../../networking/functions/initializeNetworkObject';
import { PrefabType } from '../../../../networking/templates/PrefabType';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';


/**
 * @author HydraFire <github.com/HydraFire>
 */

export const spawnEntity: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  // initializeNetworkObject({
  //   entity: args.entity,
  //   prefabType: PrefabType.RigidBody,
  //   uniqueId: args.uniqueId,
  //   override: {
  //     networkComponents: [
  //       {
  //         type: ColliderComponent,
  //         data: {
  //           bodytype:  args.parameters.bodytype,
  //           type: args.parameters.type,
  //           position: args.parameters.position,
  //           quaternion: args.parameters.quaternion,
  //           scale: args.parameters.scale,
  //           mesh: args.parameters.mesh,
  //           vertices: args.parameters.vertices,
  //           indices: args.parameters.indices,
  //           mass: args.parameters.mass
  //         }
  //       }
  //     ]
  //   }
  // });
};
