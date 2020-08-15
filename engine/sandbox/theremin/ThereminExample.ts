export const fixMe = 0

// import { ThereminComponent } from './ThereminComponent'
// import { PerspectiveCamera, Scene, Color, HemisphereLight, EquirectangularReflectionMapping, MeshStandardMaterial, MeshBasicMaterial, DirectionalLight, WebGLRenderer, sRGBEncoding, BufferGeometry, Vector3, Line } from "three"
// var container
// var camera, scene, renderer
// var hand1, hand2
// var controller1, controller2
// var controllerGrip1, controllerGrip2
// var theremin

// var controls

// // init()
// // animate()

// function init() {
//     container = document.createElement("div")
//     document.body.appendChild(container)

//     scene = new Scene()
//     scene.background = new Color(0x444444)

//     camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 30)
//     camera.position.set(-2.5, 1.6, 2.3)

//     controls = new OrbitControls(camera, container)
//     controls.minDistance = 1
//     controls.maxDistance = 6
//     controls.target.set(0, 1.3, 0)
//     controls.update()

//     scene.add(new HemisphereLight(0xaaaaaa, 0xaaaaaa))

//     let loader = new GLTFLoader()

//     new EXRLoader().load("https://cdn.glitch.com/8de0f988-71c9-4094-8537-776da69f6df2%2Fenvmap.exr?v=1597067272225", (texture) => {
//         texture.mapping = EquirectangularReflectionMapping

//         loader.load("https://cdn.glitch.com/8de0f988-71c9-4094-8537-776da69f6df2%2Ftheremin.glb?v=1597106696234", (gltf) => {
//             gltf.scene.position.y = 0.03
//             gltf.scene.children[0].children[0].material = new MeshStandardMaterial({ envMap: texture, roughness: 0, metalness: 1 })
//             gltf.scene.children[0].children[2].material.envMap = texture

//             gltf.scene.scale.set(0.73, 0.73, 0.73)
//             scene.add(gltf.scene)
//         });
//       )
// })

// loader.load("https://cdn.glitch.com/8de0f988-71c9-4094-8537-776da69f6df2%2Fdome.glb?v=1597104063074", (gltf) => {
//     gltf.scene.children[2].material = new MeshBasicMaterial({ map: gltf.scene.children[2].material.map })
//     scene.add(gltf.scene)
// });

// var light = new DirectionalLight(0xffffff)
// light.intensity = 0.2
// light.position.set(-2, 10, -2)
// scene.add(light)

// renderer = new WebGLRenderer({ antialias: true })
// renderer.setPixelRatio(window.devicePixelRatio)
// renderer.setSize(window.innerWidth, window.innerHeight)
// renderer.outputEncoding = sRGBEncoding

// renderer.xr.enabled = true

// container.appendChild(renderer.domElement)

// document.body.appendChild(VRButton.createButton(renderer))

// // controllers

// controller1 = renderer.xr.getController(0)
// scene.add(controller1)

// controller2 = renderer.xr.getController(1)
// scene.add(controller2)

// var controllerModelFactory = new XRControllerModelFactory()
// var handModelFactory = new XRHandModelFactory().setPath("https://cdn.glitch.com/8de0f988-71c9-4094-8537-776da69f6df2%2F")

// // Hand 1
// controllerGrip1 = renderer.xr.getControllerGrip(0)
// controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1))
// scene.add(controllerGrip1)

// hand1 = renderer.xr.getHand(0)
// hand1.add(handModelFactory.createHandModel(hand1, 'oculus'))

// scene.add(hand1)

// // Hand 2
// controllerGrip2 = renderer.xr.getControllerGrip(1)
// controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2))
// scene.add(controllerGrip2)

// hand2 = renderer.xr.getHand(1)
// hand2.add(handModelFactory.createHandModel(hand2, 'oculus'))
// scene.add(hand2)

// //

// var geometry = new BufferGeometry().setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, - 1)])

// var line = new Line(geometry)
// line.name = 'line'
// line.scale.z = 5

// controller1.add(line.clone())
// controller2.add(line.clone())

// //

// window.addEventListener('resize', onWindowResize, false)

//         }

// function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight
//     camera.updateProjectionMatrix()

//     renderer.setSize(window.innerWidth, window.innerHeight)

// }

// function updateTheremin() {
//     if (theremin != undefined && hand1.joints.length > 0 && hand2.joints.length > 0) {
//         theremin.update([3, 7, 12, 17, 22].flatMap((jointId) => {
//             return [hand1.joints[jointId].position, hand2.joints[jointId].position]
//         }))
//     }
// }

// function animate() {
//     renderer.setAnimationLoop(render)
// }

// function render() {
//     updateTheremin()
//     renderer.render(scene, camera)

// }

// // document.addEventListener("startxr", function (e) {
// //     if (theremin === undefined) {
// //         theremin = new ThereminComponent(
// //             { x: -0.013, y: 1.341, z: 0, width: 0.505, height: 0.464, depth: 0.450 },
// //             { x: -0.389, y: 1.289, z: 0, width: 0.317, height: 0.664, depth: 0.450 }
// //         );
// //     }
// // })
