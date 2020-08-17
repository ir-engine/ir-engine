import { Quaternion } from "cannon-es"
import { Behavior } from "../../common/interfaces/Behavior"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { ColliderComponent } from "../components/Collider"
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions"
import { Object3DComponent } from "../../common/components/Object3DComponent"
import { Entity } from "../../ecs/classes/Entity"
const quaternion = new Quaternion()
//let quaternion = new THREE.Quaternion();
//let euler = new THREE.Euler();
export const RigidBodyBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == "onAdded") {
    /*
    const collider = getComponent(entity, Collider)
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value
    //if (object) continue
    let body
    if (collider.type === "box") body = _createBox(entity)
    else if (collider.type === "cylinder") body = _createCylinder(entity)
    else if (collider.type === "share") body = _createShare(entity)
    else if (collider.type === "convex") body = _createConvexGeometry(entity, null)
    else if (collider.type === "ground") body = _createGroundGeometry(entity)

    object.userData.body = body
    PhysicsWorld.instance.physicsWorld.addBody(body)
    */
  } else if (args.phase == "onUpdate") {
    const collider = getComponent<ColliderComponent>(entity, ColliderComponent).collider
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value
    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent)

    if (args.isKinematic) {
      collider.position.x = transform.position[0]
      collider.position.x = transform.position[0]
      collider.position.x = transform.position[0]
      //  quaternion.set(collider.quaternion.x, collider.quaternion.y, collider.quaternion.z, collider.quaternion.w)
      //  transform.rotation = quaternion.toArray()
    } else {
      console.log(collider)

      transform.position = [collider.position.x, collider.position.y, collider.position.z]
      //console.log(collider.position );
      quaternion.set(collider.quaternion.x, collider.quaternion.y, collider.quaternion.z, collider.quaternion.w)
      transform.rotation = quaternion.toArray()
    }
  } else if (args.phase == "onRemoved") {
    /*
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value
    const body = object.userData.body
    delete object.userData.body
    PhysicsWorld.instance.physicsWorld.removeBody(body)
    */
  }
}

/*
function createConvexGeometry( entity , mesh){
  let rigidBody, object, transform, attributePosition
  if( mesh ) {

    object = mesh
    attributePosition = mesh.geometry.attributes.position

  } else {
    rigidBody = getComponent(entity, Collider)
    object = entity.getObject3D();
    transform = getComponent(entity, ECSYTHREEX.Transform)
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
