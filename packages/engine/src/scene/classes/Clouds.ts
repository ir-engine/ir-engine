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

import alea from 'alea'
import { createNoise3D, NoiseFunction3D } from 'simplex-noise'
import {
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  PlaneGeometry,
  RawShaderMaterial,
  ShaderMaterial,
  UniformsUtils,
  Vector2,
  Vector3
} from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { Entity } from '../../ecs/classes/Entity'
import { CloudComponent } from '../components/CloudComponent'
import { addError, removeError } from '../functions/ErrorFunctions'

const vertexShader = `
precision highp float;

attribute vec4 particles;
attribute float particleAngle;

varying vec2 vUV;

void main(){
  vUV = uv;

  vec3 rotatedPosition = position;
  rotatedPosition.x = cos( particleAngle ) * position.x - sin( particleAngle ) * position.y;
  rotatedPosition.y = sin( particleAngle ) * position.x + cos( particleAngle ) * position.y;
  float scale = particles.w;
  rotatedPosition *= scale;

  vec4 mvPosition = modelViewMatrix * vec4(particles.xyz, 1);
  mvPosition.xyz += rotatedPosition;
  gl_Position = projectionMatrix * mvPosition;
}
`
const fragmentShader = `
precision highp float;

uniform sampler2D map;

uniform vec3 fogColor;
uniform vec2 fogRange;

varying vec2 vUV;

void main() {
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = smoothstep( fogRange.x, fogRange.y, depth );

  gl_FragColor = texture2D(map,  vUV);
  gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );
	gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
}
`

export class Clouds extends Mesh<InstancedBufferGeometry, ShaderMaterial> {
  private _worldScale: Vector3
  private _texture: string
  private _dimensions: Vector3 // Number of particles (x,y,z)
  private _noiseZoom: Vector3
  private _noiseOffset: Vector3
  private _spriteScaleRange: Vector2
  private _fogRange: Vector2
  private _fogColor: Color
  _noise3D: NoiseFunction3D
  needsUpdate: boolean

  entity: Entity

  constructor(entity: Entity) {
    const planeGeometry = new PlaneGeometry(1, 1, 1, 1)
    const geometry = new InstancedBufferGeometry()
    geometry.index = planeGeometry.index
    geometry.attributes = planeGeometry.attributes

    const material = new ShaderMaterial({
      uniforms: UniformsUtils.merge([
        {
          map: { type: 't', value: null },
          fogColor: { value: null },
          fogRange: { value: null }
        }
      ]),
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false
    })

    super(geometry, material)
    this.entity = entity

    this.frustumCulled = false
    const prng = alea('seed')
    this._noise3D = createNoise3D(prng)

    this._worldScale = new Vector3()
    this._dimensions = new Vector3()
    this._noiseZoom = new Vector3()
    this._noiseOffset = new Vector3()
    this._spriteScaleRange = new Vector2()
    this._fogColor = new Color()
    this._fogRange = new Vector2()

    this.updateParticles()
  }

  private getNoise3D(x: number, y: number, z: number) {
    return (this._noise3D(x, y, z) + 1) * 0.5
  }

  updateParticles() {
    const planeGeometry = new PlaneGeometry(1, 1, 1, 1)
    const geometry = new InstancedBufferGeometry()
    geometry.index = planeGeometry.index
    geometry.attributes = planeGeometry.attributes

    const particleItemSize = 4
    const particleArray: number[] = []
    const zRotationArray: number[] = []

    for (let x = 0; x < this.dimensions.x; x++) {
      for (let y = 0; y < this.dimensions.y; y++) {
        for (let z = 0; z < this.dimensions.z; z++) {
          particleArray.push(
            this.getNoise3D(
              x / this.noiseZoom.x + this.noiseOffset.x,
              y / this.noiseZoom.x + this.noiseOffset.x,
              z / this.noiseZoom.x + this.noiseOffset.x
            ) *
              this.worldScale.x -
              this.worldScale.x * 0.5
          ) // X
          particleArray.push(
            this.getNoise3D(
              x / this.noiseZoom.y + this.noiseOffset.y,
              y / this.noiseZoom.y + this.noiseOffset.y,
              z / this.noiseZoom.y + this.noiseOffset.y
            ) *
              this.worldScale.y -
              this.worldScale.y * 0.5
          ) // Y
          particleArray.push(
            this.getNoise3D(
              x / this.noiseZoom.z + this.noiseOffset.z,
              y / this.noiseZoom.z + this.noiseOffset.z,
              z / this.noiseZoom.z + this.noiseOffset.z
            ) *
              this.worldScale.z -
              this.worldScale.z * 0.5
          ) // Z

          particleArray.push(
            this.getNoise3D(x / 7 + 2777, y / 7 + 2777, z / 7 + 2777) * this.spriteScaleRange.y +
              this.spriteScaleRange.x
          ) // Scale

          zRotationArray.push(this.getNoise3D(x / 3, y / 3, z / 3) * Math.PI)
        }
      }
    }

    geometry.setAttribute('particles', new InstancedBufferAttribute(new Float32Array(particleArray), particleItemSize))
    geometry.setAttribute('particleAngle', new InstancedBufferAttribute(new Float32Array(zRotationArray), 1))
    this.geometry = geometry
    this.material.uniforms.fogColor.value = this.fogColor
    this.material.uniforms.fogRange.value = this.fogRange
  }

  update() {
    if (this.needsUpdate) {
      this.needsUpdate = false
      this.updateParticles()
    }
  }

  copy(source: this, recursive = true) {
    super.copy(source, recursive)

    const material = this.material as RawShaderMaterial
    const sourceMaterial = source.material as RawShaderMaterial

    material.uniforms.map.value = sourceMaterial.uniforms.map.value

    this.worldScale.copy(source.worldScale)
    this.dimensions.copy(source.dimensions)
    this.noiseZoom.copy(source.noiseZoom)
    this.noiseOffset.copy(source.noiseOffset)
    this.spriteScaleRange.copy(source.spriteScaleRange)
    this.fogColor.copy(source.fogColor)
    this.fogRange.copy(source.fogRange)

    return this
  }

  get texture(): string {
    return this._texture
  }

  set texture(path: string) {
    this._texture = path
    AssetLoader.loadAsync(path)
      .then((texture) => {
        this.material.uniforms.map.value = texture
        removeError(this.entity, CloudComponent, 'TEXTURE_LOADING_ERROR')
      })
      .catch((error) => {
        addError(this.entity, CloudComponent, 'TEXTURE_LOADING_ERROR', error.message)
      })
  }

  public get worldScale(): Vector3 {
    return this._worldScale
  }

  public set worldScale(value: Vector3) {
    this._worldScale.copy(value)
    this.needsUpdate = true
  }

  public get dimensions(): Vector3 {
    return this._dimensions
  }

  public set dimensions(value: Vector3) {
    this._dimensions.copy(value)
    this.needsUpdate = true
  }

  public get noiseZoom(): Vector3 {
    return this._noiseZoom
  }

  public set noiseZoom(value: Vector3) {
    this._noiseZoom.copy(value)
    this.needsUpdate = true
  }

  public get noiseOffset(): Vector3 {
    return this._noiseOffset
  }

  public set noiseOffset(value: Vector3) {
    this._noiseOffset.copy(value)
    this.needsUpdate = true
  }

  public get spriteScaleRange(): Vector2 {
    return this._spriteScaleRange
  }

  public set spriteScaleRange(value: Vector2) {
    this._spriteScaleRange.copy(value)
    this.needsUpdate = true
  }

  public get fogRange(): Vector2 {
    return this._fogRange
  }

  public set fogRange(value: Vector2) {
    this._fogRange.copy(value)
  }

  public get fogColor(): Color {
    return this._fogColor
  }

  public set fogColor(value: Color) {
    if (typeof value === 'string') this._fogColor.set(value)
    else this._fogColor.copy(value)
  }
}
