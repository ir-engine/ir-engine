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
  Color
} from 'three'
import SimplexNoise from 'simplex-noise'

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
uniform float fogNear;
uniform float fogFar;

varying vec2 vUV;

void main() {
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = smoothstep( fogNear, fogFar, depth );

  gl_FragColor = texture2D(map,  vUV);
  gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );
	gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
}
`

export class Clouds extends Mesh {
  worldScale: Vector3
  dimensions: Vector3 // Number of particles (x,y,z)
  noiseZoom: Vector3
  noiseOffset: Vector3
  spriteScaleRange: Vector2
  fogRange: Vector2
  fogColor: Color
  noise: SimplexNoise

  constructor() {
    const planeGeometry = new PlaneBufferGeometry(1, 1, 1, 1)
    const geometry = new InstancedBufferGeometry()
    geometry.index = planeGeometry.index
    geometry.attributes = planeGeometry.attributes

    const material = new ShaderMaterial({
      uniforms: UniformsUtils.merge([
        {
          map: { type: 't', value: null },
          fogColor: { type: 'c', value: null },
          fogNear: { type: 'f', value: null },
          fogFar: { type: 'f', value: null }
        }
      ]),
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false
    })

    super(geometry, material)

    this.frustumCulled = false
    this.noise = new SimplexNoise('seed')

    this.worldScale = new Vector3()
    this.dimensions = new Vector3()
    this.noiseZoom = new Vector3()
    this.noiseOffset = new Vector3()
    this.spriteScaleRange = new Vector2()
    this.fogColor = new Color()
    this.fogRange = new Vector2()
  }

  getNoise3D(x, y, z) {
    return (this.noise.noise3D(x, y, z) + 1) * 0.5
  }

  setTexture(texture) {
    ;(this.material as any).uniforms.map.value = texture
  }

  updateParticles() {
    const planeGeometry = new PlaneBufferGeometry(1, 1, 1, 1)
    const geometry = new InstancedBufferGeometry()
    geometry.index = planeGeometry.index
    geometry.attributes = planeGeometry.attributes

    const particleItemSize = 4
    const particleArray = []
    const zRotationArray = []

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
    ;(this.material as any).uniforms.fogNear.value = this.fogRange.x
    ;(this.material as any).uniforms.fogFar.value = this.fogRange.y
  }

  update(dt: number) {}

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
}
