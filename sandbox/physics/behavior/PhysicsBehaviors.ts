import { Quaternion } from "cannon-es/src/math/Quaternion"
import { Vec3 } from "cannon-es/src/math/Vec3"
import { Body } from "cannon-es/src/objects/Body"
import { RaycastVehicle } from "cannon-es/src/objects/RaycastVehicle"
import { Box } from "cannon-es/src/shapes/Box"
import { ConvexPolyhedron } from "cannon-es/src/shapes/ConvexPolyhedron"
import { Cylinder } from "cannon-es/src/shapes/Cylinder"
import { Sphere } from "cannon-es/src/shapes/Sphere"
import { Entity } from "../../../src/ecs/classes/Entity"
import { TransformComponent } from "../../../src/transform/components/TransformComponent"
import { RigidBody } from "../components/RigidBody"
import { getComponent } from "../../../src/ecs/functions/EntityFunctions"

// export function _createBox(entity) {
//   const rigidBody = getComponent(entity, RigidBody)
//   const transform = getComponent(entity, TransformComponent)

//   const shape = new Box(new Vec3(rigidBody.scale.x / 2, rigidBody.scale.y / 2, rigidBody.scale.z / 2))

//   const body = new Body({
//     mass: rigidBody.mass,
//     position: new Vec3(transform.position.x, transform.position.y, transform.position.z)
//   })
//   const q = new Quaternion()
//   q.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
//   body.addShape(shape)

//   //  body.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
//   //  body.angularVelocity.set(0,1,1);
//   body.angularDamping = 0.5

//   return body
// }

// export function _createGroundGeometry(entity) {
//   const rigidBody = getComponent(entity, RigidBody)
//   const transform = getComponent(entity, TransformComponent)

//   const shape = new Box(new Vec3(rigidBody.scale.x / 2, rigidBody.scale.y / 2, rigidBody.scale.z / 2))

//   const body = new Body({
//     mass: rigidBody.mass,
//     position: new Vec3(transform.position.x, transform.position.y, transform.position.z)
//   })
//   const q = new Quaternion()
//   q.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
//   body.addShape(shape)

//   //  body.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
//   //  body.angularVelocity.set(0,1,1);
//   body.angularDamping = 0.5

//   return body
// }

// export function _createCylinder(entity) {
//   const rigidBody = getComponent<RigidBody>(entity, RigidBody)
//   const transform = getComponent(entity, TransformComponent)

//   const cylinderShape = new Cylinder(rigidBody.scale.x, rigidBody.scale.y, rigidBody.scale.z, 20)
//   const body = new Body({
//     mass: rigidBody.mass,
//     position: new Vec3(transform.position.x, transform.position.y, transform.position.z)
//   })
//   //body.type = Body.KINEMATIC;
//   //body.collisionFilterGroup = 1; // turn off collisions
//   const q = new Quaternion()
//   q.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
//   body.addShape(cylinderShape, new Vec3(), q)
//   //body.angularVelocity.set(0,0,1);
//   return body
// }

// export function _createShare(entity) {
//   const rigidBody = getComponent(entity, RigidBody)
//   const transform = getComponent(entity, TransformComponent)

//   const shape = new Sphere(rigidBody.scale.x / 2)

//   const body = new Body({
//     mass: rigidBody.mass,
//     position: new Vec3(transform.position.x, transform.position.y, transform.position.z)
//   })

//   body.addShape(shape)
//   return body
// }

// export function _createConvexGeometry(entity: Entity, mesh: THREE.Mesh) {
//   let rigidBody, object, transform, attributePosition
//   if (mesh) {
//     object = mesh
//     attributePosition = object.geometry.attributes.position
//   } else {
//     rigidBody = getComponent(entity, RigidBody)
//     transform = getComponent(entity, TransformComponent)
//     object = transform.getObject3D()
//     attributePosition = object.geometry.attributes.position
//   }

//   const convexBody = new Body({
//     mass: 50
//   })
//   const verts = [],
//     faces = [],
//     normals = []

//   // Get vertice
//   for (let j = 0; j < attributePosition.array.length; j += 3) {
//     verts.push(new Vec3(attributePosition.array[j], attributePosition.array[j + 1], attributePosition.array[j + 2]))
//   }
//   console.log(verts)
//   // Get faces
//   for (let j = 0; j < object.geometry.index.array.length; j += 3) {
//     faces.push([object.geometry.index.array[j], object.geometry.index.array[j + 1], object.geometry.index.array[j + 2]])
//   }
//   /*
//     for(var j=0; j<attributeNormal.array.length; j+=3){
//         normals.push([
//           attributeNormal.array[j],
//           attributeNormal.array[j+1],
//           attributeNormal.array[j+2]
//         ]);
//     }
// */
//   console.log(faces)
//   console.log(normals)
//   // Get offset
//   //  let offset = new Vec3(200,200,200);
//   // Construct polyhedron
//   const bunnyPart = new ConvexPolyhedron({ vertices: verts, faces })
//   console.log(bunnyPart)

//   const q = new Quaternion()
//   q.setFromAxisAngle(new Vec3(1, 1, 0), -Math.PI / 2)
//   //  body.addShape(cylinderShape, new Vec3(), q);
//   // Add to compound
//   convexBody.addShape(bunnyPart, new Vec3(), q) //,offset);
//   return convexBody
// }

// export function _createVehicleBody(entity: Entity, mesh: any): [RaycastVehicle, Body[]] {
//   const transform = entity.getComponent<TransformComponent>(TransformComponent)
//   let chassisBody
//   if (mesh) {
//     chassisBody = this._createConvexGeometry(entity, mesh)
//   } else {
//     const chassisShape = new Box(new Vec3(1, 1.2, 2.8))
//     chassisBody = new Body({ mass: 150 })
//     chassisBody.addShape(chassisShape)
//   }
//   //  let
//   chassisBody.position.copy(transform.position)
//   //  chassisBody.angularVelocity.set(0, 0, 0.5);
//   const options = {
//     radius: 0.5,
//     directionLocal: new Vec3(0, -1, 0),
//     suspensionStiffness: 30,
//     suspensionRestLength: 0.3,
//     frictionSlip: 5,
//     dampingRelaxation: 2.3,
//     dampingCompression: 4.4,
//     maxSuspensionForce: 100000,
//     rollInfluence: 0.01,
//     axleLocal: new Vec3(-1, 0, 0),
//     chassisConnectionPointLocal: new Vec3(),
//     maxSuspensionTravel: 0.3,
//     customSlidingRotationalSpeed: -30,
//     useCustomSlidingRotationalSpeed: true
//   }

//   // Create the vehicle
//   const vehicle = new RaycastVehicle({
//     chassisBody: chassisBody,
//     indexUpAxis: 1,
//     indexRightAxis: 0,
//     indexForwardAxis: 2
//   })

//   options.chassisConnectionPointLocal.set(1.4, -0.6, 2.35)
//   vehicle.addWheel(options)

//   options.chassisConnectionPointLocal.set(-1.4, -0.6, 2.35)
//   vehicle.addWheel(options)

//   options.chassisConnectionPointLocal.set(-1.4, -0.6, -2.2)
//   vehicle.addWheel(options)

//   options.chassisConnectionPointLocal.set(1.4, -0.6, -2.2)
//   vehicle.addWheel(options)

//   const wheelBodies = []
//   for (let i = 0; i < vehicle.wheelInfos.length; i++) {
//     const wheel = vehicle.wheelInfos[i]
//     const cylinderShape = new Cylinder(1, 1, 0.1, 20)
//     const wheelBody = new Body({
//       mass: 0
//     })
//     wheelBody.type = Body.KINEMATIC
//     wheelBody.collisionFilterGroup = 0 // turn off collisions
//     const q = new Quaternion()
//     //   q.setFromAxisAngle(new Vec3(1,0,0), -Math.PI / 2);
//     wheelBody.addShape(cylinderShape)
//     //   wheelBody.quaternion.setFromAxisAngle(new Vec3(1,0,0), -Math.PI/2)
//     wheelBodies.push(wheelBody)
//     //demo.addVisual(wheelBody);
//     //world.addBody(wheelBody);
//   }

//   return [vehicle, wheelBodies]
// }
