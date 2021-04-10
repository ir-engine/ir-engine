import { Body, Trimesh, Box, Sphere, Cylinder, Plane, Vec3 } from 'cannon-es';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { CollisionGroups } from "../enums/CollisionGroups";
import { threeToCannon } from '../classes/three-to-cannon';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export function createTrimeshFromArrayVertices (vertices, indices) {
	  indices = indices || vertices.map((v,i) => i);
		return new Trimesh(vertices, indices);
}

export function createTrimeshFromMesh (mesh) {
		return threeToCannon(mesh, {type: threeToCannon.Type.MESH});
}

export function createBoxCollider (scale) {
  if(scale == undefined) return console.error("Scale is  null");
  return new Box(new Vec3(Math.abs(scale.x), Math.abs(scale.y), Math.abs(scale.z)));
}

export function createSphereCollider (scale) {
  return new Sphere(Math.abs(scale.x));
}

export function createGroundCollider () {
  return new Plane();
}

export function createCylinderCollider (scale) {
  if(scale == undefined) return console.error("Scale is  null");
  return new Cylinder(scale.x, scale.z, scale.y*2, 10);
}

export function doThisActivateCollider (body, userData) {
	body.collisionFilterGroup = CollisionGroups.ActiveCollider;
	body.link = userData.link;
	return body;
}

export function addColliderWithoutEntity( userData, position, quaternion, scale, model = { mesh: null, vertices:null, indices: null }) {
  let shape;
	const type = userData.type
  switch (type) {
    case 'box':
      shape = createBoxCollider(scale);
      break;

    case 'ground':
      shape = createGroundCollider()
      break;

    case 'cylinder':
      shape = createCylinderCollider(scale);
      break;

    case 'sphere':
      shape = createSphereCollider(scale);
      break;

    case 'trimesh':
			if (model.mesh != null) {
				shape = createTrimeshFromMesh(model.mesh);
			} else if (model.vertices != null) {
				shape = createTrimeshFromArrayVertices(model.vertices, model.indices);
			} else {
				console.warn('!!! dont have any mesh or vertices array to create trimesh');
				return;
			}
      break;

    default:
      console.warn('create Collider undefined type !!!');
      shape = createBoxCollider(scale || {x:1, y:1, z:1});
      break;
  }

	const body = new Body({ mass: 0 });
	body.addShape(shape);

	if (type == 'ground') {
		body.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);
	}

  if (position) {
    body.position.set(position.x, position.y, position.z);
  }

  if (quaternion) {
    body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
  }

  if (userData.action == 'portal') {
    body.collisionFilterGroup = CollisionGroups.ActiveCollider;
		//@ts-ignore
		body.link = userData.link;
  } else {
    body.collisionFilterGroup = CollisionGroups.Default;
  }
  //    body.collisionFilterMask = CollisionGroups.Scene | CollisionGroups.Default | CollisionGroups.Characters | CollisionGroups.Car | CollisionGroups.TrimeshColliders;

  PhysicsSystem.physicsWorld.addBody(body);
  // console. log(body)
  return body;
}
