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

export const createMeshCollider: Behavior = ( entity: Entity, args: any ) => {
  switch (args.data) {
    case 'physics':
      addColliderWithoutEntity(
        {
          bodytype: BodyType.STATIC,
          ...args
        },
        args.position,
        args.quaternion,
        args.scale,
        {
          mesh: null,
          vertices: args.vertices,
          indices: args.indices,
          collisionLayer: args.collisionLayer,
          collisionMask: args.collisionMask
        }
      );
      break;

    case 'kinematic':
      addComponent(entity, ColliderComponent, {
        bodytype: BodyType.KINEMATIC,
        type: args.type,
        position: args.position,
        quaternion: args.quaternion,
        scale: args.scale,
        mesh: null,
        vertices: args.vertices,
        indices: args.indices,
        collisionLayer: args.collisionLayer,
        collisionMask: args.collisionMask,
        mass: args.mass ?? 1
      })
      break;

    case 'dynamic':
      createNetworkRigidBody({
        parameters: {
          bodytype: BodyType.DYNAMIC,
          type: args.type,
          scale: args.scale,
          position: args.position,
          quaternion: args.quaternion,
          mesh: null,
          mass: args.mass ?? 1,
          vertices: args.vertices,
          indices: args.indices,
          collisionLayer: args.collisionLayer,
          collisionMask: args.collisionMask
        },
        uniqueId: args.sceneEntityId,
        entity: entity
      });
      break;

    case 'vehicle':
      addCollidersToNetworkVehicle({
        parameters: {
          type: args.type,
          scale: args.scale,
          position: args.position,
          quaternion: args.quaternion,
          mesh: null,
          mass: args.mass ?? 1,
          vertices: args.vertices,
          indices: args.indices
        },
        entity: entity
      });
      break;

    default:
      console.warn('Invalid Args for Mesh Collider: ' + args.data);
      break;
  }
};
