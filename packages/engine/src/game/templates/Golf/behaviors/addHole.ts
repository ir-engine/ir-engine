import { Vector3, Quaternion } from 'three';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { Body, BodyType, createShapeFromConfig, Shape, SHAPES, Transform } from 'three-physx';
import { PhysicsSystem } from '../../../../physics/systems/PhysicsSystem';

import { addComponent, getComponent } from '../../../../ecs/functions/EntityFunctions';
import { onInteraction, onInteractionHover } from '../../../../scene/behaviors/createCommonInteractive';
import { Interactable } from '../../../../interaction/components/Interactable';
import { CollisionGroups, DefaultCollisionMask } from '../../../../physics/enums/CollisionGroups';
import { GameObject } from "../../../components/GameObject";
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';
import { GolfCollisionGroups } from '../GolfGameConstants';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const addHole: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {

  const storageTransform = getComponent(entity, TransformComponent);
  const pos = storageTransform.position ?? { x:0, y:0, z:0 };
  const rot = storageTransform.rotation ?? { x:0, y:0, z:0, w:1 };
  const scale = storageTransform.scale  ?? { x:1, y:1, z:1 };

  const shapeBox = createShapeFromConfig({
    shape: SHAPES.Box,
    options: { boxExtents: { x: scale.x, y: scale.y, z: scale.z } },
    config: {
      isTrigger: true,
      collisionLayer: GolfCollisionGroups.Hole,
      collisionMask: DefaultCollisionMask | GolfCollisionGroups.Ball | GolfCollisionGroups.Club
    }
  });

  const body = new Body({
    shapes: [shapeBox],
    type: BodyType.STATIC,
    transform: new Transform({
      translation: { x: pos.x, y: pos.y, z: pos.z },
    })
  });

  PhysicsSystem.instance.addBody(body);

  addComponent( entity, ColliderComponent, {
    bodytype: BodyType.STATIC,
    type: 'box',
    body: body
  })

  //addColliderWithEntity(entity);
};
