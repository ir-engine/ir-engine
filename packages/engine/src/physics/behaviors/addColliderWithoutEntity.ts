import { Body, Box, Sphere, Vec3 } from 'cannon-es';
import { PhysicsManager } from '../components/PhysicsManager';
import { CollisionGroups } from "../enums/CollisionGroups";
import { createTrimesh } from './physicalPrimitives';

function createBox (position, scale) {
  const shape = new Box(new Vec3(scale.x, scale.y, scale.z));
  const body = new Body({
    mass: 0
  });
/*
  const q = new Quaternion();
  q.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
  //body.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
*/
  body.addShape(shape);
  return body;
}

function createSphere (radius) {
  const shape = new Sphere(radius);

  const body = new Body({
    mass: 0,
    });

  body.addShape(shape);
  return body;
}

export function addColliderWithoutEntity( type, position, rotation, scale, mesh ) {

    let body;
    if (type === 'box') {
      mesh.visible = false;

      body = createBox(position, scale);
    //  body.computeAABB();
  		body.shapes.forEach((shape) => {
  			shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
  		});
    } else
    if (type === 'sphere') {
      mesh.visible = false;
      body = createSphere(scale);
    } else
    if (type === 'trimesh') body = createTrimesh(mesh, new Vec3(), 0);

    body.position.set(
      position.x,
      position.y,
      position.z
    );

    body.quaternion.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );
    console.warn(body);

    mesh.visible = false;

  PhysicsManager.instance.physicsWorld.addBody(body);
  return body;
}
