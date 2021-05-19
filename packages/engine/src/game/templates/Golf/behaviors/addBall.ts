import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { Body, BodyType, createShapeFromConfig, Shape, SHAPES, Transform } from 'three-physx';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { createNetworkRigidBody } from '../../../../interaction/prefabs/NetworkRigidBody';
import { addComponent, getComponent } from '../../../../ecs/functions/EntityFunctions';
import { getStorage, setStorage } from '../../../functions/functionsStorage';
import { onInteraction, onInteractionHover } from '../../../../scene/behaviors/createCommonInteractive';
import { Interactable } from '../../../../interaction/components/Interactable';
import { CollisionGroups, DefaultCollisionMask } from '../../../../physics/enums/CollisionGroups';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { GameObject } from "../../../components/GameObject";
import { GolfCollisionGroups } from '../GolfGameConstants';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const addBall: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  console.log('addBall', entityTarget)
  const uuid = getComponent(entity, GameObject).uuid;
  const storageTransform = getComponent(entity, TransformComponent);//getStorage(entity, TransformComponent);
  const pos = storageTransform.position ?? { x:0, y:0, z:0 };
  const rot = storageTransform.rotation ?? { x:0, y:0, z:0, w:1 };
  const scale = storageTransform.scale  ?? { x:1, y:1, z:1 };

  const shapeBall = createShapeFromConfig({
    shape: SHAPES.Sphere,
    options: { radius: 0.1 },

    config: {
      collisionLayer: GolfCollisionGroups.Ball,
      collisionMask: DefaultCollisionMask | GolfCollisionGroups.Hole | GolfCollisionGroups.Club
    }

  });

  const body = new Body({
    shapes: [shapeBall],
    type: BodyType.DYNAMIC,
    transform: new Transform({
      translation: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
      scale: { x: scale.x, y: scale.y, z: scale.z },
      linearVelocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 }
    }),
  });

  PhysicsSystem.instance.addBody(body);

  createNetworkRigidBody({
    entity,
    parameters: { body, bodytype: BodyType.DYNAMIC },
    uniqueId: uuid,
    // ownerId: 
  })
};
