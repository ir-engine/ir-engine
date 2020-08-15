import { Vec3 } from "cannon-es/src/math/Vec3"
import { Box } from "cannon-es/src/shapes/Box"
import { Cylinder } from "cannon-es/src/shapes/Cylinder"
import { ConvexPolyhedron } from "cannon-es/src/shapes/ConvexPolyhedron"
import { Quaternion } from "cannon-es/src/math/Quaternion"
import { Sphere } from "cannon-es/src/shapes/Sphere"
import { Body } from "cannon-es/src/objects/Body"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { getComponent } from "../../ecs/functions/EntityFunctions"
import { RigidBody } from "../../sandbox/physics"

export function createBox(rigidBody, transform) {
  const shape = new Box(new Vec3(rigidBody.scale.x / 2, rigidBody.scale.y / 2, rigidBody.scale.z / 2))
  console.log(transform)

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

export function createGroundGeometry(entity) {
  const rigidBody = getComponent<RigidBody>(entity, RigidBody)
  const transform = getComponent<TransformComponent>(entity, TransformComponent)

  const shape = new Box(new Vec3(rigidBody.scale[0] / 2, rigidBody.scale[1] / 2, rigidBody.scale[2] / 2))

  const body = new Body({
    mass: rigidBody.mass,
    position: new Vec3(transform.position[0], transform.position[0], transform.position[0])
  })
  const q = new Quaternion()
  q.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
  body.addShape(shape)

  //  body.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
  //  body.angularVelocity.set(0,1,1);
  body.angularDamping = 0.5

  return body
}

export function createCylinder(entity) {
  const rigidBody = getComponent<RigidBody>(entity, RigidBody)
  const transform = getComponent<TransformComponent>(entity, TransformComponent)

  const cylinderShape = new Cylinder(rigidBody.scale[0], rigidBody.scale[1], rigidBody.scale[2], 20)
  const body = new Body({
    mass: rigidBody.mass,
    position: new Vec3(transform.position[0], transform.position[1], transform.position[2])
  })
  //body.type = Body.KINEMATIC;
  //body.collisionFilterGroup = 1; // turn off collisions
  const q = new Quaternion()
  q.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
  body.addShape(cylinderShape, new Vec3(), q)
  //body.angularVelocity.set(0,0,1);
  return body
}

export function createSphere(entity) {
  const rigidBody = getComponent<RigidBody>(entity, RigidBody)
  const transform = getComponent<TransformComponent>(entity, TransformComponent)

  const shape = new Sphere(rigidBody.scale[0] / 2)

  const body = new Body({
    mass: rigidBody.mass,
    position: new Vec3(transform.position[0], transform.position[1], transform.position[2])
  })

  body.addShape(shape)
  return body
}

export function createConvexGeometry(entity: Entity, mesh: THREE.Mesh) {
  let rigidBody, object, transform, attributePosition
  if (mesh) {
    object = mesh
    attributePosition = object.geometry.attributes.position
  } else {
    rigidBody = getComponent(entity, RigidBody)
    transform = getComponent(entity, TransformComponent)
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
