// import { Body, Trimesh, Box, Sphere, Cylinder, Plane, Vec3 } from 'cannon-es';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { CollisionGroups } from "../enums/CollisionGroups";
import { createShapeFromConfig, Shape, SHAPES, Body, BodyType } from "@xr3ngine/three-physx";
import { Entity } from '../../ecs/classes/Entity';
import { ColliderComponent } from '../components/ColliderComponent';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../scene/components/Object3DComponent';
import { Mesh, Vector3, Quaternion } from 'three';
import { TransformComponent } from '../../transform/components/TransformComponent';

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/hexafield>
 */

export function doThisActivateCollider(body, userData) {
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

const quat1 = new Quaternion();
const quat2 = new Quaternion();
const xVec = new Vector3(1, 0, 0);
const halfPI = Math.PI / 2;

export function addColliderWithoutEntity(userData, pos = new Vector3(), rot = new Quaternion(), scale = new Vector3(), model = { mesh: null, vertices: null, indices: null }): Body {
  // console.log(userData, pos, rot, scale, model)
  const shapeArgs: any = {};
  switch (userData.type) {
    case 'box':
      shapeArgs.shape = SHAPES.Box;
      shapeArgs.options = { boxExtents: { x: Math.abs(scale.x), y: Math.abs(scale.y), z: Math.abs(scale.z) } };
      break;

    case 'ground':
      shapeArgs.shape = SHAPES.Plane;
      quat1.setFromAxisAngle(xVec, -halfPI);
      quat2.set(rot.x, rot.y, rot.z, rot.w);
      quat2.multiply(quat1);
      rot.x = quat2.x;
      rot.y = quat2.y;
      rot.z = quat2.z;
      rot.w = quat2.w;
      break;

    case 'sphere':
      shapeArgs.shape = SHAPES.Sphere;
      shapeArgs.options = { radius: Math.abs(scale.x) };
      break;

    case 'capsule':
      shapeArgs.shape = SHAPES.Capsule;
      shapeArgs.options = { halfHeight: Math.abs(scale.y), radius: Math.abs(scale.x) };
      break;

    // physx doesnt have cylinder shapes, default to convex
    case 'cylinder':
    case 'convex':
      shapeArgs.shape = SHAPES.ConvexMesh;
      shapeArgs.options = { vertices: model.vertices, indices: model.indices };
      break;

    case 'trimesh':
    default:
      shapeArgs.shape = SHAPES.TriangleMesh;
      shapeArgs.options = { vertices: model.vertices, indices: model.indices };
      break;
  }

  const shape: Shape = createShapeFromConfig(shapeArgs);

  shape.config.collisionLayer = userData.action === 'portal' ? CollisionGroups.ActiveCollider : CollisionGroups.Default;
  shape.config.collisionMask = CollisionGroups.All;

  const bodyConfig = new Body({
    shapes: [shape],
    type: BodyType.STATIC,
    transform: {
      translation: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
      scale: { x: scale.x, y: scale.y, z: scale.z },
      linearVelocity: { x: 0, y: 0, z: 0 },
      angularVelocity: { x: 0, y: 0, z: 0 },
    }
  });
  const body = PhysicsSystem.instance.addBody(bodyConfig);
  return body;
}
