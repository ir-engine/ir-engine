import * as THREE from "three"
import * as ECSY from "ecsy"
import * as ECSYTHREE from "ecsy-three"

import * as ECSYTHREEX from "ecsy-three/extras"
import * as CANNON from "cannon-es"
import { OBJLoader} from '../src/lib/OBJLoader.js'
import { GLTFLoader} from '../src/lib/GLTFLoader.js'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { createLightProbe } from '../src/scene/lightProbe';

import { ConvexBufferGeometry } from '../src/lib/ConvexGeometry.js';

import { PhysicsRigidBody } from "../src/components/physics-rigid-body"
import { VehicleBody } from "../src/components/vehicle-body"
import { WheelBody } from "../src/components/wheel-body"

import { PhysicsSystem } from "../src/systems/physics-system"
import { WheelSystem } from "../src/systems/wheel-system"


const world = new ECSYTHREE.ECSYThreeWorld()
  .registerSystem(PhysicsSystem)
  .registerSystem(WheelSystem)
  .registerComponent(ECSYTHREEX.Transform)
  .registerComponent(PhysicsRigidBody)
  .registerComponent(VehicleBody)
  .registerComponent(WheelBody)


const data = ECSYTHREEX.initialize(world, { vr: false })

const { scene, renderer, camera } = data.entities

const cam = camera.getComponent(ECSYTHREE.Object3DComponent)["value"]
cam.position.set(-7, 0,-7).multiplyScalar(0.5)
cam.lookAt(new THREE.Vector3())

setTimeout(() => {
  const domElement = document.body.querySelector("canvas")
  const controls = new OrbitControls(cam, domElement)
}, 0)

const scene3D = scene.getComponent(ECSYTHREE.Object3DComponent)["value"]

scene3D.add(new THREE.AmbientLight(0x404040))
scene3D.add(new THREE.DirectionalLight(0xaaaaaa, 0.5))

createLightProbe('piza','.png').then(light => {//'sky','.jpg'
    scene3D.add(light);
})


const miniGeo = new THREE.BoxBufferGeometry(2, 1, 4)
const miniMesh = new THREE.Mesh( miniGeo, new THREE.MeshStandardMaterial({ color: "pink" }))

const sphereGeo = new THREE.CylinderGeometry( 1, 1, 0.1, 12 )
sphereGeo.applyMatrix4( new THREE.Matrix4().makeRotationZ( - Math.PI / 2 ) );
const sphereMesh = new THREE.Mesh( sphereGeo, new THREE.MeshStandardMaterial({ color: "pink" }))

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
let car = world
  .createEntity()
  .addObject3DComponent(miniMesh, scene)
  .addComponent(VehicleBody)
  .addComponent(ECSYTHREEX.Transform, {
    position: { x: 0, y: 4, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  })
  .addComponent(ECSYTHREEX.Parent, { value: scene })

for (var i = 0; i < 4; i++) {
  world.createEntity()
    .addObject3DComponent(sphereMesh.clone(), scene)
    .addComponent(WheelBody, { vehicle: car })
    .addComponent(ECSYTHREEX.Transform, {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    })

}
*/
////////////// Floar /////////////////////////////////////////

const boxGeo = new THREE.BoxBufferGeometry(100, 0.5, 100)
const boxMesh = new THREE.Mesh( boxGeo, new THREE.MeshStandardMaterial({ color: "grey" }))

world
  .createEntity()
  .addObject3DComponent(boxMesh, scene)

  .addComponent(PhysicsRigidBody, { scale:{ x:100, y:1, z:100 }, mass: 0, type: 'box' })

  .addComponent(ECSYTHREEX.Transform, {
    position: { x: 0, y: -3.3, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  })
  .addComponent(ECSYTHREEX.Parent, { value: scene })


  const cylinderGeo = new THREE.CylinderGeometry( 1, 0.7, 0.5, 20 )
  const cylinderMesh = new THREE.Mesh( cylinderGeo, new THREE.MeshStandardMaterial({ color: "pink" }))
  /*
  setInterval(() => {
    world
      .createEntity()
      .addObject3DComponent(cylinderMesh.clone(), scene)

      .addComponent(PhysicsRigidBody, { scale:{ x:1, y:0.7, z:0.5 }, mass: 1, type: 'cylinder' })

      .addComponent(ECSYTHREEX.Transform, {
        position: { x: 0, y: 12, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
      })
      .addComponent(ECSYTHREEX.Parent, { value: scene })
  },3000)
*/


const miniBox = new THREE.BoxBufferGeometry(1, 4, 2)
const miniBoxMesh = new THREE.Mesh( miniBox, new THREE.MeshStandardMaterial({ color: "pink" }))
var verts = [-1.281104,-0.003405,0.892073,1.839549,-0.003405,0.892073,-1.281104,0.641190,0.892073,1.839549,0.641190,0.892073,-1.281104,0.641190,-0.694338,1.839549,0.641190,-0.694338,-1.281104,-0.003405,-0.694338,1.839549,-0.003405,-0.694338,0.279223,1.241851,0.892073,0.279223,1.241851,-0.694338,-0.500941,1.241851,0.892073,-0.500941,1.241851,-0.694338];

let vertices = []
for (var i=0; i<verts.length / 3; i++) {
    vertices.push(new THREE.Vector3(verts[i * 3], verts[i * 3 + 1], verts[i * 3 + 2]));
}

var convexGeometry = new ConvexBufferGeometry( vertices )
const convexMesh = new THREE.Mesh( convexGeometry, new THREE.MeshStandardMaterial({ color: "pink" }))
  world
    .createEntity()
    .addObject3DComponent(miniBoxMesh, scene)

    .addComponent(PhysicsRigidBody, { scale:{ x:1, y:4, z:2 }, mass: 100, type: 'box' })

    .addComponent(ECSYTHREEX.Transform, {
      position: { x: 0, y: 6, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    })
    .addComponent(ECSYTHREEX.Parent, { value: scene })
    
/*
    world
      .createEntity()
      .addObject3DComponent(convexMesh, scene)

      .addComponent(PhysicsRigidBody, { scale:{ x:1, y:1, z:1 }, mass: 0, type: 'convex' })

      .addComponent(ECSYTHREEX.Transform, {
        position: { x: 0, y: 2, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
      })
      .addComponent(ECSYTHREEX.Parent, { value: scene })
      */




/*
                new THREE.TextureLoader().setPath('./models/avatar/').load('pos' + template.pose + '/aoMap.jpg', string => {

                  let nmaterial = new THREE.MeshBasicMaterial() // MeshBasicMaterial // Phong
                  nmaterial.color = new THREE.Color("rgb(0, 0, 0)")
                  nmaterial.alphaMap = string

                  let mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 500, 500 ),  nmaterial);
                  mesh.position.y = 0.5;
                  mesh.rotation.x = - Math.PI / 2;

                  window.clothSimulatorApp.shadowFloar = mesh
                  obj.add( mesh );

                })
*/



      var loader = new GLTFLoader().setPath( './src/models/' ).load( 'ground.glb', function ( gltf ) {

							gltf.scene.traverse( function ( child ) {

								if ( child.isMesh ) {
                  console.log(child);
									// TOFIX RoughnessMipmapper seems to be broken with WebGL 2.0
									// roughnessMipmapper.generateMipmaps( child.material );



                    world
                      .createEntity()
                      .addObject3DComponent(child, scene)

                  //    .addComponent(PhysicsRigidBody, { scale:{ x:5, y:5, z:5 }, mass: 0, type: 'convex' })

                      .addComponent(ECSYTHREEX.Transform, {
                        position: { x: 0, y: -3, z: 0 },
                        rotation: { x: 0, y: 0, z: 0 }
                      })
                    //  .addComponent(ECSYTHREEX.Parent, { value: scene })

								}

							} );

							scene3D.add( gltf.scene );

						//	roughnessMipmapper.dispose();



						} );





            var loader = new GLTFLoader().setPath( './src/models/' ).load( 'test.glb', function ( gltf ) {

                    gltf.scene.traverse( function ( child ) {


                      if ( child.isMesh ) {

/*
                        world
                          .createEntity()
                          .addObject3DComponent(child, scene)

                          .addComponent(PhysicsRigidBody, { scale:{ x:1, y:1, z:1 }, mass: 1, type: 'convex' })

                          .addComponent(ECSYTHREEX.Transform, {
                            position: { x: 0, y: 12, z: 0 },
                            rotation: { x: 0, y: 0, z: 0 }
                          })
                          .addComponent(ECSYTHREEX.Parent, { value: scene })
*/

                        new OBJLoader()
                          .load('./src/models/Chevrolet Camaro Highway Patrol2.obj', obj => {
                            let car
                            obj.traverse((node) => {


                              if (node.type == 'Mesh') {

                                let material = new THREE.MeshPhongMaterial()
                                material.shininess = 0
                                material.roughness = 0.77
                                material.color = new THREE.Color( "rgb(200, 200, 200)" );
                                node.castShadow = true
                                node.receiveShadow = true
                                node.scale.x = 0.5;
                                node.scale.y = 0.5;
                                node.scale.z = 0.5;

                            if (node.name== "Camaro") {





                                car = world
                                  .createEntity()
                                  .addObject3DComponent(node.clone(), scene)
                                  .addComponent(VehicleBody)//, {convexMesh: child})
                                  .addComponent(ECSYTHREEX.Transform, {
                                    position: { x: 0, y: 4, z: 0 },
                                    rotation: { x: 0, y: 0, z: 0 }
                                  })
                                  .addComponent(ECSYTHREEX.Parent, { value: scene })
                              } else {

                                  world.createEntity()
                                    .addObject3DComponent(node.clone(), scene)
                                    .addComponent(WheelBody, { vehicle: car })
                                    .addComponent(ECSYTHREEX.Transform, {
                                      position: { x: 0, y: 0, z: 0 },
                                      rotation: { x: 0, y: 0, z: 0 }
                                    })
                                }

                              }

                            })})

                      }

                    } );


                    //scene3D.add( gltf.scene );

                  //	roughnessMipmapper.dispose();



                  } );

world.execute(0, 0)
