import * as THREE from "three"
import * as ECSY from "ecsy"
import * as ECSYTHREE from "ecsy-three"

import * as ECSYTHREEX from "ecsy-three/extras"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import { PhysicsRigidBody } from "../src/components/physics-rigid-body"
import { PhysicsSystem } from "../src/systems/physics-system"




const world = new ECSYTHREE.ECSYThreeWorld()
  .registerSystem(PhysicsSystem)
  .registerComponent(ECSYTHREEX.Transform)
  .registerComponent(PhysicsRigidBody)


const data = ECSYTHREEX.initialize(world, { vr: false })

const { scene, renderer, camera } = data.entities

const cam = camera.getComponent(ECSYTHREE.Object3DComponent)["value"]
cam.position.set(-4, 0,-4).multiplyScalar(0.5)
cam.lookAt(new THREE.Vector3())

setTimeout(() => {
  const domElement = document.body.querySelector("canvas")
  const controls = new OrbitControls(cam, domElement)
}, 0)

const scene3D = scene.getComponent(ECSYTHREE.Object3DComponent)["value"]

scene3D.add(new THREE.AmbientLight(0x404040))
scene3D.add(new THREE.DirectionalLight())


const miniGeo = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2)
const miniMesh = new THREE.Mesh( miniGeo, new THREE.MeshStandardMaterial({ color: "pink" }))

const sphereGeo = new THREE.SphereGeometry(0.1, 10, 10)
const sphereMesh = new THREE.Mesh( sphereGeo, new THREE.MeshStandardMaterial({ color: "pink" }))
/*
function createSphere() {
  world
    .createEntity()
    .addObject3DComponent(sphereMesh.clone(), scene)

    .addComponent(PhysicsRigidBody, {
      geometryType: 'sphere',
      scale:{ x:0.2, y:0.2, z:0.2 },
      mass: 0.1
    })

    .addComponent(ECSYTHREEX.Transform, {
      position: { x: (Math.random()*0.5) -0.25, y: 3, z: (Math.random()*0.5) -0.25 },
      rotation: { x: 0, y: 0, z: 0 }
    })
    .addComponent(ECSYTHREEX.Parent, { value: scene })
}
*/
function createBox() {
  world
    .createEntity()
    .addObject3DComponent(miniMesh.clone(), scene)

    .addComponent(PhysicsRigidBody, {
      scale:{ x:0.2, y:0.2, z:0.2 },
      mass: 0.1
    })

    .addComponent(ECSYTHREEX.Transform, {
      position: { x: (Math.random()*0.5) -0.25, y: 3, z: (Math.random()*0.5) -0.25 },
      rotation: { x: 0, y: 0, z: 0 }
    })
    .addComponent(ECSYTHREEX.Parent, { value: scene })
}


  setInterval(() => {
  //  Math.random()*2|0 ? createSphere () : createBox();
    createBox()
  }, 3000)



  const boxGeo = new THREE.BoxBufferGeometry(1, 1, 1)
  const boxMesh = new THREE.Mesh( boxGeo, new THREE.MeshStandardMaterial({ color: "pink" }))


world
  .createEntity()
  .addObject3DComponent(boxMesh.clone(), scene)

  .addComponent(PhysicsRigidBody, { scale:{ x:1, y:1, z:1 }, mass: 0 })

  .addComponent(ECSYTHREEX.Transform, {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  })
  .addComponent(ECSYTHREEX.Parent, { value: scene })



  //var groundMaterial = new CANNON.Material();
  /*
  var groundBody = new CANNON.Body({
      mass: 0 // mass == 0 makes the body static
  });
  var groundShape = new CANNON.Plane();
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),Math.PI/2);
  worldPhysics.addBody(groundBody);
  */

  // for (let id = 0; id <= 1; id++) {
  //   world
  //     .createEntity()
  //     // .addComponent(ECSYTHREE.VRController, { id })
  //     .addComponent(ECSYTHREEX.Parent, { value: scene })
  // }




world.execute(0, 0)
