// @ts-nocheck
import {
  Mesh,
  InstancedBufferGeometry,
  PlaneBufferGeometry,
  ShaderMaterial,
  Vector3,
  Color,
  InstancedBufferAttribute,
  AddEquation,
  Texture,
  BufferAttribute,
  RawShaderMaterial,
  Matrix4,
  UniformsUtils,
  UniformsLib,
  DynamicDrawUsage,
  DoubleSide
} from 'three'
import * as EasingFunctions from '../../common/functions/EasingFunctions'
import loadTexture from '../../assets/functions/loadTexture'
import { lerp, clamp } from '../../common/functions/MathLerpFunctions'
import { DEG2RAD, vertexShader, fragmentShader } from './particleHelpers'

interface ParticleEmitterGeometry extends InstancedBufferGeometry {
  attributes: {
    position: BufferAttribute
    uv: BufferAttribute
    particlePosition: InstancedBufferAttribute
    particleColor: InstancedBufferAttribute
    particleAngle: InstancedBufferAttribute
  }
}

export class ParticleEmitterMesh extends Mesh {
  initialPositions: number[]
  initialAges: number[]
  startSize: number
  endSize: number
  sizeRandomness: number
  startVelocity: Vector3
  endVelocity: Vector3
  angularVelocity: number
  particleCount: number
  lifetime: number
  lifetimes: number[]
  lifetimeRandomness: number
  particleSizeRandomness: number[]
  ageRandomness: number
  ages: number[]
  colors: number[]
  endColor: Color
  middleColor: Color
  startColor: Color
  startOpacity: number
  middleOpacity: number
  endOpacity: number
  colorCurve: string
  velocityCurve: string
  sizeCurve: string
  worldScale: Vector3
  inverseWorldScale: Vector3
  count: number
  src: string = '/static/editor/dot.png'
  constructor(args: any) {
    createParticles()
    // TODO: refactor this to use registerSceneLoadPromise
    loadTexture(args.src).then((texture: Texture) => {
      createParticles(args, texture)
    })
  }

  createParticles(args, texture: Texture) {
    const planeGeometry = new PlaneBufferGeometry(1, 1, 1, 1)
    const geometry = new InstancedBufferGeometry()
    geometry.index = planeGeometry.index
    geometry.attributes = planeGeometry.attributes

    texture.flipY = false
    const material = new ShaderMaterial({
      uniforms: UniformsUtils.merge([
        {
          map: { value: texture },
          emitterMatrix: { value: new Matrix4() }
        },
        UniformsLib.fog
      ]),
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      fog: true,
      blendEquation: AddEquation,
      side: DoubleSide
    })

    material.uniforms.map.value = texture
    material.uniforms.emitterMatrix.value = new Matrix4()

    this.geometry = geometry
    this.material = material
    this.frustumCulled = false
    this.initialPositions = []
    this.lifetimes = []
    this.particleSizeRandomness = []
    this.initialAges = []
    this.ages = []
    this.colors = []
    this.inverseWorldScale = new Vector3()
    this.worldScale = new Vector3()

    for (const key of Object.keys(args)) {
      this[key] = args[key]
    }

    this.updateParticles()
  }

  updateParticles() {
    const texture = ((this as any).material as ShaderMaterial).uniforms.map.value
    const planeGeometry = new PlaneBufferGeometry(1, 1, 1, 1)
    const tempGeo = new InstancedBufferGeometry()
    tempGeo.index = planeGeometry.index
    tempGeo.attributes = planeGeometry.attributes

    const positions = []
    const colors = []
    const lifetimes = []
    const ages = []
    const initialAges = []
    const initialPositions = []
    const particleSizeRandomness = []
    const angles = []

    ;(this as any).getWorldScale(this.worldScale)

    for (let i = 0; i < this.particleCount; i++) {
      initialAges[i] = Math.random() * this.ageRandomness - this.ageRandomness
      lifetimes[i] = this.lifetime + Math.random() * 2 * this.lifetimeRandomness
      ages[i] = initialAges[i]
      initialPositions[i * 3] = Math.random() * 2 - 1 // X
      initialPositions[i * 3 + 1] = Math.random() * 2 - 1 // Y
      initialPositions[i * 3 + 2] = 0 // Z
      particleSizeRandomness[i] = Math.random() * this.sizeRandomness

      positions.push(initialPositions[i * 3] * this.worldScale.x)
      positions.push(initialPositions[i * 3 + 1] * this.worldScale.y)
      positions.push(initialPositions[i * 3 + 2])
      positions.push(this.startSize + particleSizeRandomness[i])

      angles.push(0)
      colors.push(this.startColor.r, this.startColor.g, this.startColor.b, 0)
    }
    tempGeo.setAttribute(
      'particlePosition',
      new InstancedBufferAttribute(new Float32Array(positions), 4).setUsage(DynamicDrawUsage)
    )
    tempGeo.setAttribute(
      'particleColor',
      new InstancedBufferAttribute(new Float32Array(colors), 4).setUsage(DynamicDrawUsage)
    )
    tempGeo.setAttribute(
      'particleAngle',
      new InstancedBufferAttribute(new Float32Array(angles), 1).setUsage(DynamicDrawUsage)
    )
    ;(this as any).geometry = tempGeo as ParticleEmitterGeometry
    this.initialPositions = initialPositions
    this.particleSizeRandomness = particleSizeRandomness
    this.ages = ages
    this.initialAges = initialAges
    this.lifetimes = lifetimes
    this.colors = colors
  }

  update(dt: number) {
    const geometry = (this as any).geometry as ParticleEmitterGeometry
    const particlePosition = geometry.attributes.particlePosition.array as Float32Array
    const particleColor = geometry.attributes.particleColor.array as Float32Array
    const particleAngle = geometry.attributes.particleAngle.array as Float32Array

    ;(this as any).getWorldScale(this.worldScale)
    this.inverseWorldScale.set(1 / this.worldScale.x, 1 / this.worldScale.y, 1 / this.worldScale.z)

    const material = (this as any).material as ShaderMaterial
    const emitterMatrix: Matrix4 = material.uniforms.emitterMatrix.value
    emitterMatrix.copy((this as any).matrixWorld)
    emitterMatrix.scale(this.inverseWorldScale)

    for (let i = 0; i < this.particleCount; i++) {
      const prevAge = this.ages[i]
      const curAge = (this.ages[i] += dt)

      // Particle is dead
      if (curAge < 0) {
        continue
      }

      // // Particle became alive
      if (curAge > 0 && prevAge <= 0) {
        particleColor[i * 4 + 3] = this.startOpacity
        particlePosition[i * 4] = this.initialPositions[i * 3] * this.worldScale.x
        particlePosition[i * 4 + 1] = this.initialPositions[i * 3 + 1] * this.worldScale.y
        particlePosition[i * 4 + 2] = 0
        particlePosition[i * 4 + 3] = this.startSize + this.particleSizeRandomness[i]
        particleColor[i * 4] = this.startColor.r
        particleColor[i * 4 + 1] = this.startColor.g
        particleColor[i * 4 + 2] = this.startColor.b
        continue
      }

      // Particle died
      if (curAge > this.lifetimes[i]) {
        this.ages[i] = this.initialAges[i]
        particleColor[i * 4 + 3] = 0 // Set opacity to zero
        continue
      }

      const normalizedAge = clamp(this.ages[i] / this.lifetimes[i], 0, 1)

      const _EasingFunctions = EasingFunctions as { [name: string]: (k: number) => number }

      if (!_EasingFunctions[this.velocityCurve]) {
        console.warn(`Unknown velocity curve type ${this.velocityCurve} in particle emitter. Falling back to linear.`)
        this.velocityCurve = 'linear'
      }
      if (!_EasingFunctions[this.sizeCurve]) {
        console.warn(`Unknown size curve type ${this.sizeCurve} in particle emitter. Falling back to linear.`)
        this.sizeCurve = 'linear'
      }
      if (!_EasingFunctions[this.colorCurve]) {
        console.warn(`Unknown color curve type ${this.colorCurve} in particle emitter. Falling back to linear.`)
        this.colorCurve = 'linear'
      }
      const velFactor = _EasingFunctions[this.velocityCurve](normalizedAge)
      const sizeFactor = _EasingFunctions[this.sizeCurve](normalizedAge)
      const colorFactor = _EasingFunctions[this.colorCurve](normalizedAge)

      particlePosition[i * 4] += lerp(this.startVelocity.x, this.endVelocity.x, velFactor) * dt
      particlePosition[i * 4 + 1] += lerp(this.startVelocity.y, this.endVelocity.y, velFactor) * dt
      particlePosition[i * 4 + 2] += lerp(this.startVelocity.z, this.endVelocity.z, velFactor) * dt
      particlePosition[i * 4 + 3] = lerp(
        this.startSize + this.particleSizeRandomness[i],
        this.endSize + this.particleSizeRandomness[i],
        sizeFactor
      )
      particleAngle[i] += this.angularVelocity * DEG2RAD * dt

      if (colorFactor <= 0.5) {
        const colorFactor1 = colorFactor / 0.5
        particleColor[i * 4] = lerp(this.startColor.r, this.middleColor.r, colorFactor1)
        particleColor[i * 4 + 1] = lerp(this.startColor.g, this.middleColor.g, colorFactor1)
        particleColor[i * 4 + 2] = lerp(this.startColor.b, this.middleColor.b, colorFactor1)
        particleColor[i * 4 + 3] = lerp(this.startOpacity, this.middleOpacity, colorFactor1)
      } else if (colorFactor > 0.5) {
        const colorFactor2 = (colorFactor - 0.5) / 0.5
        particleColor[i * 4] = lerp(this.middleColor.r, this.endColor.r, colorFactor2)
        particleColor[i * 4 + 1] = lerp(this.middleColor.g, this.endColor.g, colorFactor2)
        particleColor[i * 4 + 2] = lerp(this.middleColor.b, this.endColor.b, colorFactor2)
        particleColor[i * 4 + 3] = lerp(this.middleOpacity, this.endOpacity, colorFactor2)
      }
    }

    geometry.attributes.particlePosition.needsUpdate = true
    geometry.attributes.particleColor.needsUpdate = true
    geometry.attributes.particleAngle.needsUpdate = true
  }

  copy(source: this, recursive = true) {
    super.copy(source, recursive)

    const material = (this as any).material as RawShaderMaterial
    const sourceMaterial = (source as any).material as RawShaderMaterial

    material.uniforms.map.value = sourceMaterial.uniforms.map.value
    this.startColor.copy(source.startColor)
    this.middleColor.copy(source.middleColor)
    this.endColor.copy(source.endColor)
    this.startOpacity = source.startOpacity
    this.middleOpacity = source.middleOpacity
    this.endOpacity = source.endOpacity
    this.colorCurve = source.colorCurve
    this.sizeCurve = source.sizeCurve
    this.startSize = source.startSize
    this.endSize = source.endSize
    this.sizeRandomness = source.sizeRandomness
    this.ageRandomness = source.ageRandomness
    this.lifetime = source.lifetime
    this.lifetimeRandomness = source.lifetimeRandomness
    this.particleCount = source.particleCount
    this.startVelocity.copy(source.startVelocity)
    this.endVelocity.copy(source.endVelocity)
    this.velocityCurve = source.velocityCurve
    this.angularVelocity = source.angularVelocity

    return this
  }
}
