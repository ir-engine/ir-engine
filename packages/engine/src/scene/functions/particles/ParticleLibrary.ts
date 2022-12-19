import { Group } from 'three'

import Dust, { DefaultArgs as DustDefaultArgs } from './library/Dust'
import { ParticleSystemType } from './ParticleTypes'

export type ParticleSystemGenerator = (container: Group, args: any) => Promise<ParticleSystemType>

export const ParticleLibrary = {
  Dust: Dust
} as Record<string, ParticleSystemGenerator>

export const DefaultArguments = {
  Dust: DustDefaultArgs
}
