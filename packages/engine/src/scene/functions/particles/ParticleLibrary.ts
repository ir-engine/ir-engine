import { Group } from 'three'

import Dust, { DefaultArgs as DustDefaultArgs } from './library/Dust'
import { ParticleSystem } from './ParticleTypes'

export type ParticleSystemGenerator = (container: Group, args) => Promise<ParticleSystem>

export const ParticleLibrary = {
  Dust: Dust
} as Record<string, ParticleSystemGenerator>

export const DefaultArguments = {
  Dust: DustDefaultArgs
}
