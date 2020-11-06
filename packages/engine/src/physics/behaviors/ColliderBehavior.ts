import { Mesh } from 'three';
import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import {
  createBox,
  createCylinder,
  createSphere,
  createTrimesh
} from './physicalPrimitives';
import { CollisionGroups } from "../enums/CollisionGroups";
import { Entity } from '../../ecs/classes/Entity';
import { PhysicsManager } from '../components/PhysicsManager';
import { getMutableComponent, hasComponent, getComponent, addComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { cannonFromThreeVector } from '../../common/functions/cannonFromThreeVector';
import { Vec3, Shape, Body } from 'cannon-es';

export const addCollider: Behavior = (entity: Entity, args: { type: string; phase?: string }): void => {
  if (args.phase === 'onRemoved') {
    const collider = getComponent<ColliderComponent>(entity, ColliderComponent, true);
    if (collider) {
      PhysicsManager.instance.physicsWorld.removeBody(collider.collider);
    }
    return;
  }

  const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent);
  const transform = getComponent<TransformComponent>(entity, TransformComponent);

  // if simple mesh do computeBoundingBox()
  if (hasComponent(entity, Object3DComponent)){
    const mesh = getComponent(entity, Object3DComponent).value
    if (mesh instanceof Mesh) {
      mesh.geometry.computeBoundingBox();
    }
  }

  let body;
  switch (collider.type) {
    case 'box':
      body = createBox(entity)
      break;

    case 'cylinder':
      body = createCylinder(entity);
      break;

    case 'sphere':
      body = createSphere(entity);
      break;

    case 'trimesh':
    body = createTrimesh(
        getMutableComponent<Object3DComponent>(entity, Object3DComponent as any).value,
        new Vec3(),
        collider.mass
      );
      break;

    default:
      body = createBox(entity)
      break;
  }

  body.position.set(
    transform.position.x,
    transform.position.y,
    transform.position.z
  );

/*
    body.shapes.forEach((shape) => {
			shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
		});
*/
		//body.collisionFilterGroup = 1;

  collider.collider = body;

  PhysicsManager.instance.physicsWorld.addBody(collider.collider);
};
