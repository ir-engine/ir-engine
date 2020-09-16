import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { PhysicsManager } from '../components/PhysicsManager';
import { getMutableComponent, hasComponent, getComponent, addComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { cannonFromThreeVector } from '../../common/functions/cannonFromThreeVector';
import { Vec3, Box, Cylinder, Material, ContactMaterial, Quaternion, Sphere, Body } from 'cannon-es';
import { threeToCannon } from '@xr3ngine/engine/src/templates/world/three-to-cannon';


function createTrimesh (position, rotation, scale, mesh) {
    mesh = mesh.clone();

		let shape = threeToCannon(mesh, {type: threeToCannon.Type.MESH});
		//shape['material'] = mat;
		// Add phys sphere
		let body = new Body({
			mass: 0
		});
    body.addShape(shape);
	//	body.material = PhysicsManager.instance.trimMeshMaterial;

		return body;
}




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
  return body
}






export function addColliderWithoutEntity( type, position, rotation, scale, mesh ) {

    let body;
    if (type === 'box') {
      body = createBox(position, scale)
    //  body.computeAABB();
  	//	body.shapes.forEach((shape) => {
  	//		shape.collisionFilterMask = 4;
  	//	})
    } else
    if (type === 'trimesh') body = createTrimesh(position, rotation, scale, mesh);

    body.position.set(
      position.x,
      position.y -14.8,
      position.z
    )

    body.quaternion.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    )

  PhysicsManager.instance.physicsWorld.addBody(body);
};
