import { InstancedBufferGeometry, BufferGeometry, ShaderMaterial, Texture, Blending } from "three";
import { Material } from "cannon-es";

export type ParticleGeometry = InstancedBufferGeometry | BufferGeometry

export type FrameStyle = "sequence" | "randomsequence" | "random"

export interface ParticleMesh {
  geometry: ParticleGeometry
  material: ParticleMeshMaterial
  userData: {
    nextIndex: number
    meshConfig: any
  }
}

export interface ParticleMeshMaterial extends ShaderMaterial {
  map: Texture
  originalMaterial: Material
}

export interface textureFrame {
  cols: number
  rows: number
}

export interface particleMeshOptions {
  particleCount?: number
  texture?: string | Texture
  textureFrame?: textureFrame
  style?: "particle" | "mesh"
  mesh?: any
  particleSize?: number
  transparent?: boolean
  alphaTest?: number
  depthWrite?: boolean
  depthTest?: boolean
  blending?: Blending
  fog?: boolean
  usePerspective?: boolean
  useLinearMotion?: boolean
  useOrbitalMotion?: boolean
  useAngularMotion?: boolean
  useRadialMotion?: boolean
  useWorldMotion?: boolean
  useBrownianMotion?: boolean
  useVelocityScale?: boolean
  useFramesOrOrientation?: boolean
}

export interface ParticleEmitter {
  startTime: number
  startIndex: number
  endIndex: number
  mesh: ParticleMesh
}

export interface emitterOptions {
  particleMesh: ParticleMesh
  enabled?: boolean
  count?: number // use all available particles
  textureFrame?: textureFrame
  lifeTime?: number | number[] // may also be [min,max]
  repeatTime?: number // if 0, use the maximum lifeTime
  burst?: number // if 1 all particles are spawned at once
  seed?: number // a number between 0 and 1
  worldUp?: boolean // particles relative to world UP (they will get rotated if the camera tilts)
}

export interface particleOptions {
  // per particle values
  atlas?: string
  frames?: number[]
  colors?: Color[]
  orientations?: number[]
  scales?: number[]
  opacities?: number[]
  frameStyle?: FrameStyle
  offset?: Vector
  velocity?: Vector
  acceleration?: Vector
  radialVelocity?: number
  radialAcceleration?: number
  angularVelocity?: Vector
  angularAcceleration?: Vector
  orbitalVelocity?: number
  orbitalAcceleration?: number
  worldAcceleration?: Vector
  brownianSpeed?: number
  brownianScale?: number
  velocityScale?: number
  velocityScaleMin?: number
  velocityScaleMax?: number
}

export interface ParticleEmitterInterface extends emitterOptions, particleOptions {}

export interface Vector {
  x: number
  y: number
  z: number
}

export interface Color {
  r: number
  g: number
  b: number
}
