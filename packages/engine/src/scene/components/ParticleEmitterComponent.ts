import { Color, Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ParticleEmitterComponentType = {
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
  src: string
}

export const ParticleEmitterComponent = createMappedComponent<ParticleEmitterComponentType>('ParticleEmitterComponent')
