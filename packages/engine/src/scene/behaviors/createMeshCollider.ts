import { BodyType } from "three-physx";
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { addComponent } from '../../ecs/functions/EntityFunctions';
import { ColliderComponent } from '../../physics/components/ColliderComponent';
import { addColliderWithoutEntity } from '../../physics/behaviors/colliderCreateFunctions';
import { createNetworkRigidBody } from '../../interaction/prefabs/NetworkRigidBody';
import { addCollidersToNetworkVehicle } from '../../vehicle/prefabs/NetworkVehicle';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const createMeshCollider: Behavior = ( entity: Entity, args: any ) => { //{ data:string, type: string,}
  //console.log('****** Collider from Scene data: ', args);

  switch (args.objArgs.data) {

    case 'physics':
      addColliderWithoutEntity(
        {
          bodytype: BodyType.STATIC,
          type: args.objArgs.type
        },
        args.objArgs.position,
        args.objArgs.quaternion,
        args.objArgs.scale,
        {
          mesh: null,
          vertices: args.objArgs.vertices,
          indices: args.objArgs.indices,
          collisionLayer: args.objArgs.collisionLayer,
          collisionMask: args.objArgs.collisionMask
        }
      );
      break;

    case 'kinematic':
      addComponent(entity, ColliderComponent, {
        bodytype: BodyType.KINEMATIC,
        type: args.objArgs.type,
        position: args.objArgs.position,
        quaternion: args.objArgs.quaternion,
        scale: args.objArgs.scale,
        mesh: null,
        vertices: args.objArgs.vertices,
        indices: args.objArgs.indices,
        collisionLayer: args.objArgs.collisionLayer,
        collisionMask: args.objArgs.collisionMask,
        mass: args.objArgs.mass ?? 1
      })
      break;

    case 'dynamic':
      createNetworkRigidBody({
        parameters: {
          bodytype: BodyType.DYNAMIC,
          type: args.objArgs.type,
          scale: args.objArgs.scale,
          position: args.objArgs.position,
          quaternion: args.objArgs.quaternion,
          mesh: null,
          mass: args.objArgs.mass ?? 1,
          vertices: args.objArgs.vertices,
          indices: args.objArgs.indices,
          collisionLayer: args.objArgs.collisionLayer,
          collisionMask: args.objArgs.collisionMask
        },
        uniqueId: args.objArgs.sceneEntityId,
        entity: entity
      });
      break;

    case 'vehicle':
      addCollidersToNetworkVehicle({
        parameters: {
          type: args.objArgs.type,
          scale: args.objArgs.scale,
          position: args.objArgs.position,
          quaternion: args.objArgs.quaternion,
          mesh: null,
          mass: args.objArgs.mass ?? 1,
          vertices: args.objArgs.vertices,
          indices: args.objArgs.indices
        },
        entity: entity
      });
      break;

    default:
      console.warn('args.objArgs.data: '+args.objArgs.data);
      break;
  }
};
