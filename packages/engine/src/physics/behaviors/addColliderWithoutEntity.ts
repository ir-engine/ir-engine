import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { PhysicsManager } from '../components/PhysicsManager';
import { getMutableComponent, hasComponent, getComponent, addComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { cannonFromThreeVector } from '../../common/functions/cannonFromThreeVector';
import { Vec3, Box, Cylinder, Material, ContactMaterial, Quaternion, Sphere, Body } from 'cannon-es';
import { threeToCannon } from '@xr3ngine/engine/src/templates/world/three-to-cannon';
import { createTrimesh } from './physicalPrimitives';
import { CollisionGroups } from "../enums/CollisionGroups";




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
      body = createBox(position, scale);
    //  body.computeAABB();
  		body.shapes.forEach((shape) => {
  			shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
  		});
    } else
    if (type === 'sphere') {
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

  PhysicsManager.instance.physicsWorld.addBody(body);
  return body;
}
