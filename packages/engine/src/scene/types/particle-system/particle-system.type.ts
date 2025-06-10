import { Entity } from '@ir-engine/ecs'
import { BufferGeometry, Material, Texture } from 'three'
import { BatchedRenderer, Behavior, ParticleSystem, ParticleSystemJSONParameters } from 'three.quarks'
import { BehaviorJSON } from './behavior.type'
import { ColorGeneratorJSON } from './color-generator.type'
import { BurstParametersJSON } from './sequencer.type'
import { ValueGeneratorJSON } from './value-generator.type'

export type ParticleSystemRendererInstance = {
  renderer: BatchedRenderer
  rendererEntity: Entity
  instanceCount: number
}

export type RendererSettingsJSON = {
  startLength: ValueGeneratorJSON
  followLocalOrigin: boolean
}

export type ExtraSystemJSON = {
  instancingGeometry: string
  startColor: ColorGeneratorJSON
  startRotation: ValueGeneratorJSON
  startSize: ValueGeneratorJSON
  startSpeed: ValueGeneratorJSON
  startLife: ValueGeneratorJSON
  behaviors: BehaviorJSON[]
  emissionBursts: BurstParametersJSON[]
  rendererEmitterSettings?: RendererSettingsJSON
}

export type ExpandedSystemJSON = ParticleSystemJSONParameters & ExtraSystemJSON

export type ParticleSystemMetadata = {
  geometries: { [key: string]: BufferGeometry }
  materials: { [key: string]: Material }
  textures: { [key: string]: Texture }
}

export type ParticleSystemComponentType = {
  systemParameters: ExpandedSystemJSON
  behaviorParameters: BehaviorJSON[]

  system?: ParticleSystem | undefined
  behaviors?: Behavior[] | undefined
}
