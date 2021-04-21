// import { Body, Trimesh, Box, Sphere, Cylinder, Plane, Vec3 } from 'cannon-es';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { CollisionGroups } from "../enums/CollisionGroups";
import { createShapeFromConfig, PhysXBodyType, PhysXModelShapes, PhysXShapeConfig, RigidBodyProxy } from 'three-physx';
import { Entity } from '../../ecs/classes/Entity';
import { ColliderComponent } from '../components/ColliderComponent';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../scene/components/Object3DComponent';
import { Mesh } from 'three';
import { TransformComponent } from '../../transform/components/TransformComponent';

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/hexafield>
 */

export function doThisActivateCollider(body, userData): PhysXShapeConfig {
  body.collisionFilterGroup = CollisionGroups.ActiveCollider;
  body.link = userData.link;
  return body;
}

export function addColliderWithEntity(entity: Entity) {

  const colliderComponent = getMutableComponent<ColliderComponent>(entity, ColliderComponent);
  const transformComponent = getComponent<TransformComponent>(entity, TransformComponent);

  // if simple mesh do computeBoundingBox()
  let mesh, vertices, indices;
  if (hasComponent(entity, Object3DComponent)) {
    mesh = getComponent(entity, Object3DComponent).value
    if (mesh instanceof Mesh) {
      mesh.geometry.computeBoundingBox();
      vertices = Array.from(mesh.geometry.attributes.position.array);
      indices = mesh.geometry.index ? Array.from(mesh.geometry.index.array) : Object.keys(vertices).map(Number);
    }
  }

  const body = addColliderWithoutEntity(
    { type: colliderComponent.type },
    transformComponent.position,
    transformComponent.rotation,
    transformComponent.scale,
    { mesh, vertices, indices }
  );
  colliderComponent.body = body;
}

export function addColliderWithoutEntity(userData, pos, rot, scale, model = { mesh: null, vertices: null, indices: null }): RigidBodyProxy {

  const shapeArgs: any = {};
  switch (userData.type) {
    case 'box':
      shapeArgs.type = PhysXModelShapes.Box;
      shapeArgs.options = { boxExtents: { x: Math.abs(scale.x), y: Math.abs(scale.y), z: Math.abs(scale.z) } };
      break;

    case 'ground':
      shapeArgs.type = PhysXModelShapes.Plane;
      break;

    case 'sphere':
      shapeArgs.type = PhysXModelShapes.Sphere;
      shapeArgs.options = { radius: Math.abs(scale.x) };
      break;

    case 'capsule':
      shapeArgs.type = PhysXModelShapes.Capsule;
      shapeArgs.options = { halfHeight: Math.abs(scale.y), radius: Math.abs(scale.x) };
      break;

    // physx doesnt have cylinder shapes, default to convex
    case 'cylinder':
    case 'convex':
      shapeArgs.type = PhysXModelShapes.ConvexMesh;
      shapeArgs.options = { vertices: model.vertices, indices: model.indices };
      break;

    case 'trimesh':
    default:
      shapeArgs.type = PhysXModelShapes.TriangleMesh;
      shapeArgs.options = { vertices: model.vertices, indices: model.indices };
      break;
  }

  const shape: PhysXShapeConfig = createShapeFromConfig(shapeArgs);

  shape.config.collisionLayer = userData.action === 'portal' ? CollisionGroups.ActiveCollider : CollisionGroups.Default;

  const bodyConfig = {
    shapes: [shape],
    type: PhysXBodyType.STATIC,
    transform: {
      translation: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
      scale: { x: scale.x, y: scale.y, z: scale.z },
      linearVelocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 },
    }
  }

  const body = PhysicsSystem.instance.addBody(bodyConfig);
  console.log(body)
  return body;
}
