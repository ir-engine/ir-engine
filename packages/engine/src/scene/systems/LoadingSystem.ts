import { AmbientLight, Box3, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { GLTFLoader } from '@xrengine/engine/src/assets/loaders/gltf/GLTFLoader'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'

/**
 * @author Dhara Patel <github.com/frozencrystal>
 */

export class LoadingRenderer {
  static instance: LoadingRenderer
  canvas: HTMLCanvasElement
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
  gltfScene: any
  needsResize: boolean
  constructor() {
    LoadingRenderer.instance = this
    //Todo
    this.onResize = this.onResize.bind(this)

    const loaderRendererCanvasId = 'loader-renderer-canvas'
    const canvasElement = document.getElementById(loaderRendererCanvasId) as any
    const url = 'https://172.160.10.156:3000/models/devices/razer_laptop.glb'
    this.scene = new Scene()
    this.camera = new PerspectiveCamera(75)
    this.renderer = new WebGLRenderer({
      canvas: canvasElement,
      alpha: true
    })

    this.scene.add(this.camera)
    this.renderer.render(this.scene, this.camera)

    const light = new AmbientLight(0xffffff)
    this.scene.add(light)

    const width = window.innerWidth
    const height = window.innerHeight
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    new GLTFLoader().load(
      url,
      (gltf) => {
        this.gltfScene = gltf.scene
        this.scene.add(gltf.scene)
        const bbox = new Box3().setFromObject(gltf.scene)
        bbox.getCenter(this.camera.position)
        this.camera.position.z = bbox.max.z + 1
      },
      undefined,
      () => {
        console.log('Error Loading GLTF From URl')
      }
    )

    window.addEventListener('resize', this.onResize, false)
    this.onResize()
  }

  onResize(): void {
    this.needsResize = true
  }

  execute(delta: number): void {
    if (this.needsResize) {
      const width = window.innerWidth
      const height = window.innerHeight
      this.renderer.setSize(width, height)
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.needsResize = false
    }
    if (this.gltfScene) this.gltfScene.rotation.y += 0.01
    this.renderer.render(this.scene, this.camera)
  }
}
export default async function LoadingSystem(world: World): Promise<System> {
  new LoadingRenderer()
  return () => {
    LoadingRenderer.instance.execute(world.delta)
  }
}
