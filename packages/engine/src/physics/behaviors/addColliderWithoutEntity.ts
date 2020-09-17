import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { PhysicsManager } from '../components/PhysicsManager';
import { getMutableComponent, hasComponent, getComponent, addComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { cannonFromThreeVector } from '../../common/functions/cannonFromThreeVector';
import { Vec3, Box, Cylinder, Quaternion, Sphere, Body } from 'cannon-es';


/*



import { TransformComponent } from '../../transform/components/TransformComponent';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Entity } from '../../ecs/classes/Entity';
import { ColliderComponent } from '../components/ColliderComponent';
import { RigidBody } from '../components/RigidBody';
import { MeshTagComponent } from '../../common/components/Object3DTagComponents';
import { Vector3 } from 'three';
*/
function createBox (position, scale) {

  let mass = 0;

  const shape = new Box(new Vec3(scale.x, scale.y, scale.z));

  const body = new Body({
    mass: mass
  });

  const q = new Quaternion();
  q.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2);

  body.addShape(shape);

  //body.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
  return body
}






export function addColliderWithoutEntity( type, position, rotation, scale ) {
    console.log(type+' '+position.x+' '+rotation.w+' '+scale.x);



    let body;
    if (type === 'box') body = createBox(position, scale);
  //  else if (args.type === 'cylinder') body = createCylinder();

    body.position.set(
      position.x,
      position.y -14.8,
      position.z
    )
    console.log(body);

    body.quaternion.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    )

  PhysicsManager.instance.physicsWorld.addBody(body);
};
