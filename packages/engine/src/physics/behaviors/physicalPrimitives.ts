import { threeToCannon } from '@xr3ngine/engine/src/templates/world/three-to-cannon';
import { Body, Box, ConvexPolyhedron, Cylinder, Plane, Quaternion, Sphere, Vec3 } from 'cannon-es';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import { CollisionGroups } from "../enums/CollisionGroups";

export function createTrimesh (mesh, position, mass) {
    mesh = mesh.clone();

		const shape = threeToCannon(mesh, {type: threeToCannon.Type.MESH});
		// Add phys sphere
    shape.collisionFilterGroup = CollisionGroups.TrimeshColliders;
		const body = new Body({ mass });
    body.addShape(shape, position);
		return body;
}

export function createGround (entity: Entity) {
  const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent);
  const transformComponent = getComponent<TransformComponent>(entity, TransformComponent);
  const shape = new Plane();
  const body = new Body({ mass: 0 });
  body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);

  if (colliderComponent.position) {
    body.position.set(
      colliderComponent.position.x,
      colliderComponent.position.y,
      colliderComponent.position.z
    );
  } else {
    body.position.set(
      transformComponent.position.x,
      transformComponent.position.y,
      transformComponent.position.z
    );
  }
  body.addShape(shape);
  return body;
}

export function createBox (entity: Entity) {
  const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent);
  const transformComponent = getComponent<TransformComponent>(entity, TransformComponent);

  const shape = new Box( new Vec3(
      colliderComponent.scale.x,
      colliderComponent.scale.y,
      colliderComponent.scale.z
    )
  );
  const body = new Body({
    mass: colliderComponent.mass,
  });

  // Set position
  if (colliderComponent.position) {
    body.position.set(
      colliderComponent.position.x,
      colliderComponent.position.y,
      colliderComponent.position.z
    );
  } else {
    body.position.set(
      transformComponent.position.x,
      transformComponent.position.y,
      transformComponent.position.z
    );
  }

  // Set Rotation

  if (colliderComponent.quaternion) {
    body.quaternion.set(
      colliderComponent.quaternion.x,
      colliderComponent.quaternion.y,
      colliderComponent.quaternion.z,
      colliderComponent.quaternion.w
    );
  }

  body.addShape(shape);
  return body;
}

export function createCylinder (entity: Entity) {
  const rigidBody = getComponent<ColliderComponent>(entity, ColliderComponent);
  const transform = getComponent<TransformComponent>(entity, TransformComponent);

  const cylinderShape = new Cylinder(rigidBody.scale[0], rigidBody.scale[1], rigidBody.scale[2], 20);
  const body = new Body({
    mass: rigidBody.mass,
    position: new Vec3(transform.position[0], transform.position[1], transform.position[2])
  });
  const q = new Quaternion();
  q.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
  body.addShape(cylinderShape, new Vec3(), q);
  return body;
}

export function createSphere (entity: Entity) {
  const collider = getComponent<ColliderComponent>(entity, ColliderComponent);
  const transformComponent = getComponent<TransformComponent>(entity, TransformComponent);

  const shape = new Sphere(collider.scale.x);

  const body = new Body({
    mass: collider.mass,
  });

  body.addShape(shape);
  // Set position
  if (collider.position) {
    body.position.set(
      collider.position.x,
      collider.position.y,
      collider.position.z
    );
  } else {
    body.position.set(
      transformComponent.position.x,
      transformComponent.position.y,
      transformComponent.position.z
    );
  }
  body.angularDamping = 0.5;
  return body;
}

export function createConvexGeometry (entity: Entity, mesh: any) {
  let rigidBody, object, transform, attributePosition;
  if (mesh) {
    object = mesh;
    attributePosition = object.geometry.attributes.position;
  } else {
    rigidBody = getComponent(entity, ColliderComponent);
    transform = getComponent(entity, TransformComponent);
    object = transform.getObject3D();
    attributePosition = object.geometry.attributes.position;
  }

  const convexBody = new Body({
    mass: 50
  });
  const verts = [];
  const faces = [];
  // const normals = [];

  // Get vertice
  for (let j = 0; j < attributePosition.array.length; j += 3) {
    verts.push(new Vec3(attributePosition.array[j], attributePosition.array[j + 1], attributePosition.array[j + 2]));
  }
  // console.log(verts);
  // Get faces
  for (let j = 0; j < object.geometry.index.array.length; j += 3) {
    faces.push([object.geometry.index.array[j], object.geometry.index.array[j + 1], object.geometry.index.array[j + 2]]);
  }
  // Construct polyhedron
  const bunnyPart = new ConvexPolyhedron({ vertices: verts, faces });

  const q = new Quaternion();
  q.setFromAxisAngle(new Vec3(1, 1, 0), -Math.PI / 2);
  // Add to compound
  convexBody.addShape(bunnyPart, new Vec3(), q); //, offset);
  return convexBody;
}
