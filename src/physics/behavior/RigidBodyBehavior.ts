import { Quaternion } from "cannon-es/src/math/Quaternion"
import { Vec3 } from "cannon-es/src/math/Vec3"
import { Behavior } from "../../common/interfaces/Behavior"
import { Object3DComponent } from "ecsy-three"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { PhysicsWorld } from "../components/PhysicsWorld"
import { Entity } from "ecsy"
import { RigidBody } from "../components/RigidBody"
import {
  _createBox,
  _createCylinder,
  _createShare,
  _createConvexGeometry,
  _createGroundGeometry
} from "../behavior/PhysicsBehaviors"

export const quaternion = new Quaternion()
//let quaternion = new THREE.Quaternion();
//let euler = new THREE.Euler();
export const RigidBodyBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == "onAdded") {
    const rigidBody = entity.getComponent(RigidBody)
    const transform = entity.getMutableComponent(TransformComponent)
    const object = entity.getComponent<Object3DComponent>(Object3DComponent).value

    //  object ? "" : (object = { userData: { body: {} } })
    let body
    if (rigidBody.type === "box") body = _createBox(entity)
    else if (rigidBody.type === "cylinder") body = _createCylinder(entity)
    else if (rigidBody.type === "share") body = _createShare(entity)
    else if (rigidBody.type === "convex") body = _createConvexGeometry(entity, null)
    else if (rigidBody.type === "ground") body = _createGroundGeometry(entity)

    //console.log(body);
    transform.position = body.position

    quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)

    transform.rotation = quaternion.toArray()
    //object.userData.body = body;
    PhysicsWorld.instance._physicsWorld.addBody(body)
  } else if (args.phase == "onRemoved") {
    const object = entity.getComponent<Object3DComponent>(Object3DComponent).value
    const body = object.userData.body
    //delete object.userData.body
    PhysicsWorld.instance._physicsWorld.removeBody(body)
  }
}

/*
function createConvexGeometry( entity , mesh){
  let rigidBody, object, transform, attributePosition
  if( mesh ) {

    object = mesh
    attributePosition = mesh.geometry.attributes.position

  } else {
    rigidBody = entity.getComponent(Collider)
    object = entity.getObject3D();
    transform = entity.getComponent(ECSYTHREEX.Transform)
    attributePosition = object.geometry.attributes.position
  }


  var convexBody = new CANNON.Body({
    mass: 50
  });
    let verts = [], faces = [], normals =[]


    // Get vertice
    for(let j = 0; j < attributePosition.array.length; j+=3){
        verts.push(new CANNON.Vec3( attributePosition.array[j] ,
                                    attributePosition.array[j+1],
                                    attributePosition.array[j+2] ));
    }
    console.log(verts);
    // Get faces

    for(var j=0; j<object.geometry.index.array.length; j+=3){
        faces.push([
          object.geometry.index.array[j],
          object.geometry.index.array[j+1],
          object.geometry.index.array[j+2]
        ]);
    }

    for(var j=0; j<attributeNormal.array.length; j+=3){
        normals.push([
          attributeNormal.array[j],
          attributeNormal.array[j+1],
          attributeNormal.array[j+2]
        ]);
    }

console.log(faces);
console.log(normals);
    // Get offset
  //  let offset = new CANNON.Vec3(200,200,200);

    // Construct polyhedron
    var bunnyPart = new CANNON.ConvexPolyhedron({ vertices: verts, faces });
    console.log(bunnyPart);

    var q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(1,1,0), -Math.PI/2);
  //  body.addShape(cylinderShape, new CANNON.Vec3(), q);
    // Add to compound
    convexBody.addShape(bunnyPart, new CANNON.Vec3(), q)//,offset);
    return convexBody
}
*/
