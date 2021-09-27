import {
  Mesh,
  PlaneBufferGeometry,
  Color,
  WebGLRenderTarget,
  ShaderMaterial,
  CubeTextureLoader,
  CubeTexture,
  sRGBEncoding
} from 'three'
import { Updatable } from '../interfaces/Updatable'
import { WaveSimulator } from './water/WaveSimulator'

import vertexShader from './water/shaders/surface/vertex'
import fragmentShader from './water/shaders/surface/fragment'
import { Vector3 } from 'three'

function loadCubeMap(path): Promise<CubeTexture> {
  const loader = new CubeTextureLoader().setPath(path)
  const negx = 'negx.jpg'
  const negy = 'negy.jpg'
  const negz = 'negz.jpg'
  const posx = 'posx.jpg'
  const posy = 'posy.jpg'
  const posz = 'posz.jpg'
  return new Promise((resolve, reject) => {
    loader.load([posx, negx, posy, negy, posz, negz], resolve, null!, (error) => reject(error))
  })
}

export class Water extends Mesh implements Updatable {
  waveSimulator: WaveSimulator
  firstRun: boolean
  timer: number
  dropTimer: number
  refractionRT: WebGLRenderTarget
  white: Color
  _cubePath: string

  constructor() {
    const material = new ShaderMaterial({
      uniforms: {
        height: { value: null },
        envMap: { value: null },
        skybox: { value: null },
        localCameraPos: { value: new Vector3() }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    })

    const gridSize = 512

    const waterGeometry = new PlaneBufferGeometry(2, 2, gridSize, gridSize)
    super(waterGeometry, material)
    this.rotation.x = -Math.PI * 0.5

    this.dropTimer = 0
    this.timer = 0.0
    this.firstRun = true
    this.waveSimulator = new WaveSimulator(gridSize)
    this.white = new Color()
    this.setupRenderTarget()
  }

  setupRenderTarget() {
    // Target for computing the water refraction
    this.refractionRT = new WebGLRenderTarget(window.innerWidth, window.innerHeight)
  }

  addRandomDrops(renderer) {
    for (var i = 0; i < 5; i++) {
      this.waveSimulator.addDrop(renderer, Math.random() * 2 - 1, Math.random() * 2 - 1, 0.03, i & 1 ? 0.02 : -0.02)
    }
    this.firstRun = false
  }

  onBeforeRender = (renderer, scene, camera) => {
    // Update the water height map
    if (this.timer > 0.032) {
      this.waveSimulator.stepSimulation(renderer)
      const waterSimulationTexture = this.waveSimulator.target.texture
      this.heightMap = waterSimulationTexture
      this.worldToLocal(this._material.uniforms.localCameraPos.value.copy(camera.position))
      this.timer = 0
    }

    if (this.dropTimer > 10.0 || this.firstRun) {
      this.addRandomDrops(renderer)
      this.dropTimer = 0
      this.firstRun = false
    }

    // Render everything but the water surface
    const currentRenderTarget = renderer.getRenderTarget()

    renderer.setRenderTarget(this.refractionRT)
    renderer.setClearColor(this.white, 1)
    renderer.clear()

    this.visible = false
    renderer.render(scene, camera)
    renderer.setRenderTarget(currentRenderTarget)
    this.envMap = this.refractionRT.texture
    this.visible = true
  }

  update(dt: number) {
    this.timer += dt
    this.dropTimer += dt
  }

  get _material(): ShaderMaterial {
    return this.material as ShaderMaterial
  }

  get skyBox(): string {
    return this._cubePath
  }

  set skyBox(path: string) {
    this._cubePath = path

    loadCubeMap(path)
      .then((texture) => {
        texture.encoding = sRGBEncoding
        this._material.uniforms.skybox.value = texture
      })
      .catch(console.error)
  }

  set heightMap(value) {
    this._material.uniforms.height.value = value
  }

  set envMap(value) {
    this._material.uniforms.envMap.value = value
  }
}
