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
import { PhysicsManager } from '../components/PhysicsManager';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';

export const ColliderBehavior: Behavior = (entity: Entity, args: { phase: string }): void => {
  if (args.phase == 'onAdded') {
    const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent);
    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
    let body;
    if (collider.type === 'box') body = createBox(entity);
    else if (collider.type === 'cylinder') body = createCylinder(entity);
    else if (collider.type === 'share') body = createSphere(entity);
    else if (collider.type === 'convex') body = createConvexGeometry(entity, getMutableComponent<Object3DComponent>(entity, Object3DComponent as any).value);
    else if (collider.type === 'ground') body = createGroundGeometry(entity);

    collider.collider = body;
    PhysicsManager.instance.physicsWorld.addBody(body);
  } else if (args.phase == 'onRemoved') {
    const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent).collider;
    PhysicsManager.instance.physicsWorld.removeBody(collider);
  }
};
