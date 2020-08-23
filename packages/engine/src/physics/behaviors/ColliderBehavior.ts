import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import {
  createBox,
  createCylinder,
  createSphere,
  createConvexGeometry,
  createGroundGeometry
} from './PhysicsBehaviors';
import { Entity } from '../../ecs/classes/Entity';
import { PhysicsWorld } from '../../physics/components/PhysicsWorld';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';

export const ColliderBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == 'onAdded') {
    const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent);
    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
    let body;
    if (collider.type === 'box') body = createBox(entity);
    else if (collider.type === 'cylinder') body = createCylinder(entity);
    else if (collider.type === 'share') body = createSphere(entity);
    else if (collider.type === 'convex') body = createConvexGeometry(entity);
    else if (collider.type === 'ground') body = createGroundGeometry(entity);

    collider.collider = body;
    PhysicsWorld.instance.physicsWorld.addBody(body);
  } else if (args.phase == 'onRemoved') {
    const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent).collider;
    PhysicsWorld.instance.physicsWorld.removeBody(collider);
  }
};
