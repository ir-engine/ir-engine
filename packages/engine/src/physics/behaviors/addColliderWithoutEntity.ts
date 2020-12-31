import { Body, Box, Sphere, Cylinder, Plane, Vec3 } from 'cannon-es';
import { PhysicsManager } from '../components/PhysicsManager';
import { CollisionGroups } from "../enums/CollisionGroups";
import { createTrimesh } from './physicalPrimitives';

function createBox (scale = {x: 1, y: 1, z: 1}) {
  const shape = new Box(new Vec3(scale.x, scale.y, scale.z));
  const body = new Body({ mass: 0 });
  body.addShape(shape);
  return body;
}

function createSphere (radius) {
  const shape = new Sphere(radius);
  const body = new Body({ mass: 0 });
  body.addShape(shape);
  return body;
}

export function createGround () {
  const shape = new Plane();
  const body = new Body({ mass: 0 });
  body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
  body.addShape(shape);
  return body;
}

export function createCylinder (scale = {x: 1, y: 1, z: 1}) {
  const shape = new Cylinder(scale.x, scale.y, scale.z, 20);
  const body = new Body({ mass: 0 });
  body.addShape(shape);
  return body;
}

export function addColliderWithoutEntity( type, position = {x: 0, y: 0, z: 0}, quaternion= {x: 1, y: 0, z: 0, w: 0}, scale= {x: 1, y: 1, z: 1}, mesh ) {
  //  mesh.visible = false;
  let body;

  switch (type) {
    case 'box':
      body = createBox(scale = {x: 1, y: 1, z: 1});
      body.shapes.forEach((shape) => {
  			shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
  		});
      break;

    case 'ground':
      body = createGround()
      break;

    case 'cylinder':
      body = createCylinder(scale);
      break;

    case 'sphere':
      body = createSphere(scale);
      break;

    case 'trimesh':
    body = createTrimesh(mesh, new Vec3(), 0);
      break;

    default:
      console.warn('create Collider undefined type !!!');
      body = createBox(scale);
      break;
    }

    body.position.set(
      position.x,
      position.y,
      position.z
    );

    if (quaternion)
    body.quaternion.set(
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w
    );

  PhysicsManager.instance.physicsWorld.addBody(body);
  return body;
}
