import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { Body, BodyType, createShapeFromConfig, Shape, SHAPES, Transform } from 'three-physx';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';
import { getStorage, setStorage } from '../../../functions/functionsStorage';
import { createNetworkRigidBody } from '../../../../interaction/prefabs/NetworkRigidBody';
import { CollisionGroups, DefaultCollisionMask } from '../../../../physics/enums/CollisionGroups';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { GameObject } from "../../../components/GameObject";
import { getComponent } from '../../../../ecs/functions/EntityFunctions';
import { GolfCollisionGroups } from '../GolfGameConstants';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const addClub: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const uuid = getComponent(entity, GameObject).uuid;

  const storageTransform = getComponent(entity, TransformComponent);
  const pos = storageTransform.position ?? { x:0, y:0, z:0 };
  const rot = storageTransform.rotation ?? { x:0, y:0, z:0, w:1 };
  const scale = storageTransform.scale  ?? { x:1, y:1, z:1 };

  const shapeHandle = createShapeFromConfig({
    shape: SHAPES.Box,
    options: { boxExtents: { x: 0.05, y: 0.05, z: 0.25 } },
    config: {
      collisionLayer: GolfCollisionGroups.Club,
      collisionMask: CollisionGroups.Default | CollisionGroups.Ground
    }
  });
  const shapeHead = createShapeFromConfig({
    shape: SHAPES.Box,
    options: { boxExtents: { x: 0.025, y: 0.1, z: 0.05 } },
    transform: new Transform({
      translation: { x: 0, y: 0.1, z: -1.7 }
    }),
    config: {
      collisionLayer: GolfCollisionGroups.Club,
      collisionMask: DefaultCollisionMask | GolfCollisionGroups.Ball
    }
  });

  const body = new Body({
    shapes: [shapeHandle, shapeHead],
    type: BodyType.DYNAMIC,
    transform: new Transform({
      translation: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
      scale: { x: scale.x, y: scale.y, z: scale.z }
    })
  });

  PhysicsSystem.instance.addBody(body);
  console.log(body.shapes[0].config, body.shapes[1].config)

  createNetworkRigidBody({
    entity,
    parameters: { body, bodytype: BodyType.DYNAMIC },
    uniqueId: uuid
  })
};
