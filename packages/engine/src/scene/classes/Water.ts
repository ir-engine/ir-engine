/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Color, Mesh, PlaneGeometry, ShaderMaterial, SRGBColorSpace, Vector3, WebGLRenderTarget } from 'three'

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
        texture.colorSpace = SRGBColorSpace
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
