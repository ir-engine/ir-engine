import {
  Mesh,
  InstancedBufferGeometry,
  PlaneBufferGeometry,
  ShaderMaterial,
  Vector3,
  InstancedBufferAttribute,
  RawShaderMaterial,
  UniformsUtils,
  Vector2,
  Color,
  Texture,
  TextureLoader
} from 'three'
import SimplexNoise from 'simplex-noise'
import { TGALoader } from '../../assets/loaders/tga/TGALoader'

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

function loadTexture(src): Promise<Texture> {
  const loader = src.endsWith('tga') ? new TGALoader() : new TextureLoader()
  return new Promise((resolve, reject) => {
    loader.load(src, resolve, null, (error) => reject(error))
  })
}

export class Clouds extends Mesh {
  private _worldScale: Vector3
  private _texture: string
  private _dimensions: Vector3 // Number of particles (x,y,z)
  private _noiseZoom: Vector3
  private _noiseOffset: Vector3
  private _spriteScaleRange: Vector2
  private _fogRange: Vector2
  private _fogColor: Color
  _noise: SimplexNoise
  needsUpdate: boolean

  constructor() {
    const planeGeometry = new PlaneBufferGeometry(1, 1, 1, 1)
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

    this.frustumCulled = false
    this._noise = new SimplexNoise('seed')

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
    return (this._noise.noise3D(x, y, z) + 1) * 0.5
  }

  updateParticles() {
    const planeGeometry = new PlaneBufferGeometry(1, 1, 1, 1)
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
    ;(this.material as any).uniforms.fogColor.value = this.fogColor
    ;(this.material as any).uniforms.fogRange.value = this.fogRange
  }

  update(dt: number) {
    if (this.needsUpdate) {
      this.needsUpdate = false
      this.updateParticles()
    }
  }

  copy(source: this, recursive = true) {
    super.copy(source, recursive)

    const material = (this as any).material as RawShaderMaterial
    const sourceMaterial = (source as any).material as RawShaderMaterial

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

    loadTexture(path)
      .then((texture) => {
        ;(this.material as any).uniforms.map.value = texture
      })
      .catch(console.error)
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
