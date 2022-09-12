import { Color, Mesh, PlaneGeometry, ShaderMaterial, sRGBEncoding, WebGLRenderTarget } from 'three'
import { Vector3 } from 'three'

import { loadCubeMapTexture } from '../constants/Util'
import fragmentShader from './water/shaders/surface/fragment'
import vertexShader from './water/shaders/surface/vertex'
import { WaveSimulator } from './water/WaveSimulator'

export class Water extends Mesh {
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

    const waterGeometry = new PlaneGeometry(2, 2, gridSize, gridSize)
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
    loadCubeMapTexture(
      path,
      (texture) => {
        texture.encoding = sRGBEncoding
        this._material.uniforms.skybox.value = texture
      },
      undefined,
      console.error
    )
  }

  set heightMap(value) {
    this._material.uniforms.height.value = value
  }

  set envMap(value) {
    this._material.uniforms.envMap.value = value
  }
}
