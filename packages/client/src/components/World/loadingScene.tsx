import { AmbientLight, Box3, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { GLTFLoader } from '@xrengine/engine/src/assets/loaders/gltf/GLTFLoader'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'

export const create3DLoadingScreen = (id) => {
  const canvasElement = document.getElementById(id) as any
  const url = 'https://172.160.10.156:3000/models/devices/razer_laptop.glb'
  const scene = new Scene()
  const camera = new PerspectiveCamera(75)
  const renderer = new WebGLRenderer({
    canvas: canvasElement,
    alpha: true
  })

  scene.add(camera)
  renderer.render(scene, camera)

  const light = new AmbientLight(0xffffff)
  scene.add(light)

  const width = window.innerWidth
  const height = window.innerHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setClearColor(0x000000, 0)
  renderer.setSize(window.innerWidth, window.innerHeight)

  let gltfScene
  new GLTFLoader().load(
    url,
    (gltf) => {
      gltfScene = gltf.scene
      scene.add(gltf.scene)
      const bbox = new Box3().setFromObject(gltf.scene)
      bbox.getCenter(camera.position)
      camera.position.z = bbox.max.z + 1
    },
    undefined,
    () => {
      console.log('Error Loading GLTF From URl')
    }
  )

  var animate = function () {
    if (gltfScene) gltfScene.rotation.y += 0.01
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }

  animate()

  window.addEventListener(
    'resize',
    (event) => {
      const width = window.innerWidth
      const height = window.innerHeight
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    },
    false
  )

  EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, async () => {
    canvasElement.style.display = 'none'
  })
}
