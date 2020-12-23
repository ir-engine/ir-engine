import { Vec3 } from 'cannon-es';
import { Mesh } from 'three';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { ColliderComponent } from '../components/ColliderComponent';
import { PhysicsManager } from '../components/PhysicsManager';
import {
  createBox,
  createCylinder,
  createGround, createSphere,
  createTrimesh
} from './physicalPrimitives';

export const handleCollider: Behavior = (entity: Entity, args: { phase?: string }): void => {


  if (args.phase === 'onRemoved') {
    const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent, true);
    if (colliderComponent) {
      PhysicsManager.instance.physicsWorld.removeBody(colliderComponent.collider);
    }
    return;
  }

  // onAdd
  const colliderComponent = getMutableComponent<ColliderComponent>(entity, ColliderComponent);
  console.warn(colliderComponent);

  // if simple mesh do computeBoundingBox()
  if (hasComponent(entity, Object3DComponent)){
    const mesh = getComponent(entity, Object3DComponent).value
    if (mesh instanceof Mesh) {
      mesh.geometry.computeBoundingBox();
    }
  }


  let body;
  console.log("Adding collider of type", colliderComponent.type);

  switch (colliderComponent.type) {
    case 'box':
      body = createBox(entity)
      break;

    case 'ground':
      body = createGround(entity)
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
        colliderComponent.mass
      );
      break;

    default:
      body = createBox(entity)
      break;
  }

/*
    body.shapes.forEach((shape) => {
			shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
		});
*/
		//body.collisionFilterGroup = 1;

};
