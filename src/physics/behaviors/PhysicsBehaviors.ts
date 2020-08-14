import { Vec3 } from "cannon-es/src/math/Vec3"
import { Box } from "cannon-es/src/shapes/Box"
import { Cylinder } from "cannon-es/src/shapes/Cylinder"
import { ConvexPolyhedron } from "cannon-es/src/shapes/ConvexPolyhedron"
import { Quaternion } from "cannon-es/src/math/Quaternion"
import { Sphere } from "cannon-es/src/shapes/Sphere"
import { Body } from "cannon-es/src/objects/Body"
import { Entity } from "ecsy"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { RigidBody } from "../components/RigidBody"

export function _createBox(rigidBody, transform) {

  const shape = new Box(new Vec3(rigidBody.scale.x / 2, rigidBody.scale.y / 2, rigidBody.scale.z / 2))
  console.log(transform);

  const body = new Body({
    mass: rigidBody.mass,
    position: new Vec3(transform[0], transform[1], transform[2])
  })
  const q = new Quaternion()
  q.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
  body.addShape(shape)

  //  body.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
  //  body.angularVelocity.set(0,1,1);
  body.angularDamping = 0.5

  return body
}

export function _createGroundGeometry(entity) {
  const rigidBody = entity.getComponent(RigidBody)
  const transform = entity.getComponent(TransformComponent)

  const shape = new Box(new Vec3(rigidBody.scale.x / 2, rigidBody.scale.y / 2, rigidBody.scale.z / 2))

  const body = new Body({
    mass: rigidBody.mass,
    position: new Vec3(transform.position.x, transform.position.y, transform.position.z)
  })
  const q = new Quaternion()
  q.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
  body.addShape(shape)

  //  body.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
  //  body.angularVelocity.set(0,1,1);
  body.angularDamping = 0.5

  return body
}

export function _createCylinder(entity) {
  const rigidBody = entity.getComponent(RigidBody)
  const transform = entity.getComponent(TransformComponent)

  const cylinderShape = new Cylinder(rigidBody.scale.x, rigidBody.scale.y, rigidBody.scale.z, 20)
  const body = new Body({
    mass: rigidBody.mass,
    position: new Vec3(transform.position.x, transform.position.y, transform.position.z)
  })
  //body.type = Body.KINEMATIC;
  //body.collisionFilterGroup = 1; // turn off collisions
  const q = new Quaternion()
  q.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
  body.addShape(cylinderShape, new Vec3(), q)
  //body.angularVelocity.set(0,0,1);
  return body
}

export function _createShare(entity) {
  const rigidBody = entity.getComponent(RigidBody)
  const transform = entity.getComponent(TransformComponent)

  const shape = new Sphere(rigidBody.scale.x / 2)

  const body = new Body({
    mass: rigidBody.mass,
    position: new Vec3(transform.position.x, transform.position.y, transform.position.z)
  })

  body.addShape(shape)
  return body
}

export function _createConvexGeometry(entity: Entity, mesh: THREE.Mesh) {
  let rigidBody, object, transform, attributePosition
  if (mesh) {
    object = mesh
    attributePosition = object.geometry.attributes.position
  } else {
    rigidBody = entity.getComponent(RigidBody)
    transform = entity.getComponent(TransformComponent)
    object = transform.getObject3D()
    attributePosition = object.geometry.attributes.position
  }

  const convexBody = new Body({
    mass: 50
  })
  const verts = [],
    faces = [],
    normals = []

  // Get vertice
  for (let j = 0; j < attributePosition.array.length; j += 3) {
    verts.push(new Vec3(attributePosition.array[j], attributePosition.array[j + 1], attributePosition.array[j + 2]))
  }
  console.log(verts)
  // Get faces
  for (let j = 0; j < object.geometry.index.array.length; j += 3) {
    faces.push([object.geometry.index.array[j], object.geometry.index.array[j + 1], object.geometry.index.array[j + 2]])
  }
  /*
    for(var j=0; j<attributeNormal.array.length; j+=3){
        normals.push([
          attributeNormal.array[j],
          attributeNormal.array[j+1],
          attributeNormal.array[j+2]
        ]);
    }
*/
  console.log(faces)
  console.log(normals)
  // Get offset
  //  let offset = new Vec3(200,200,200);
  // Construct polyhedron
  const bunnyPart = new ConvexPolyhedron({ vertices: verts, faces })
  console.log(bunnyPart)

  const q = new Quaternion()
  q.setFromAxisAngle(new Vec3(1, 1, 0), -Math.PI / 2)
  //  body.addShape(cylinderShape, new Vec3(), q);
  // Add to compound
  convexBody.addShape(bunnyPart, new Vec3(), q) //,offset);
  return convexBody
}
