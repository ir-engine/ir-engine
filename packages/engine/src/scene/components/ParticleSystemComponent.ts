import { useEffect } from 'react'
import { AdditiveBlending, Blending, BufferGeometry, Color, Texture, TextureLoader, Vector4 } from 'three'
import {
  Behavior,
  ColorGenerator,
  ColorGeneratorFromJSON,
  ColorOverLife,
  ConstantColor,
  ConstantValue,
  EmitterShape,
  FunctionColorGenerator,
  FunctionJSON,
  FunctionValueGenerator,
  IntervalValue,
  ParticleSystem,
  ParticleSystemJSONParameters,
  PointEmitter,
  RandomColor,
  RenderMode,
  ShapeJSON,
  ValueGenerator,
  ValueGeneratorFromJSON
} from 'three.quarks'
import matches, { Validator } from 'ts-matches'

import { getState, MatchesWithDefault, none } from '@xrengine/hyperflux'

import { defineComponent, getComponent, getComponentState, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { ParticleSystemState } from '../systems/ParticleSystem'

export type ParticleSystemComponentType = {
  systemParameters: ParticleSystemJSONParameters
  behaviorParameters: any[]

  system?: ParticleSystem | undefined
}

export const ParticleSystemJSONParametersValidator = matches.shape({
  version: matches.string,
  autoDestroy: matches.boolean,
  looping: matches.boolean,
  duration: matches.number,
  shape: matches.shape({
    type: matches.string,
    radius: matches.number.optional(),
    arc: matches.number.optional(),
    thickness: matches.number.optional(),
    angle: matches.number.optional(),
    mesh: matches.string.optional()
  }),
  startLife: matches.object,
  startSpeed: matches.object,
  startRotation: matches.object,
  startSize: matches.object,
  startColor: matches.object,
  emissionOverTime: matches.object,
  emissionOverDistance: matches.object,
  onlyUsedByOther: matches.boolean,
  rendererEmitterSettings: matches.shape({
    startLength: matches.object.optional(),
    followLocalOrigin: matches.boolean.optional()
  }),
  renderMode: matches.natural,
  texture: matches.string,
  startTileIndex: matches.natural,
  uTileCount: matches.natural,
  vTileCount: matches.natural,
  blending: matches.natural,
  behaviors: matches.arrayOf(matches.any),
  worldSpace: matches.boolean
})

export const DEFAULT_PARTICLE_SYSTEM_PARAMETERS: ParticleSystemJSONParameters = {
  version: '',
  autoDestroy: false,
  looping: false,
  duration: 0,
  shape: { type: '' },
  startLife: {},
  startSpeed: {},
  startRotation: {},
  startSize: {},
  startColor: {},
  emissionOverTime: {},
  emissionOverDistance: {},
  onlyUsedByOther: false,
  rendererEmitterSettings: {
    startLength: undefined,
    followLocalOrigin: undefined
  },
  renderMode: 0,
  texture: '',
  startTileIndex: 0,
  uTileCount: 1,
  vTileCount: 1,
  blending: 0,
  behaviors: [],
  worldSpace: true
}

export const ParticleSystemComponent = defineComponent({
  name: 'EE_ParticleSystem',
  onInit: (entity) => {
    return {
      systemParameters: DEFAULT_PARTICLE_SYSTEM_PARAMETERS,
      behaviorParameters: []
    } as ParticleSystemComponentType
  },
  onSet: (entity, component, json) => {
    if (!json) return
    !!json.systemParameters &&
      Object.entries(json.systemParameters).map(([field, value]: [keyof ParticleSystemJSONParameters, any]) => {
        matches.partial({ parser: ParticleSystemJSONParametersValidator }).test({ [field]: value }) &&
          component.systemParameters[field].set(value)
      })

    const hasBehaviors = !!json.behaviorParameters
    hasBehaviors && component.behaviorParameters.set(new Array(json.behaviorParameters.length))
    hasBehaviors && json.behaviorParameters.map((behavior, index) => component.behaviorParameters[index].set(behavior))
  },
  onRemove: (entity, component) => {
    if (component.system.value) {
      const particleSystemState = getState(ParticleSystemState)
      const batchRenderer = particleSystemState.batchSystem.value
      batchRenderer.remove(component.system.value.emitter)
      component.system.value.dispose()
      component.system.set(none)
    }
  },
  reactor: function ({ root }: EntityReactorProps) {
    const entity = root.entity
    if (!hasComponent(entity, ParticleSystemComponent)) throw root.stop()
    const component = getComponent(entity, ParticleSystemComponent)
    const componentState = getComponentState(entity, ParticleSystemComponent)
    const particleSystemState = getState(ParticleSystemState)
    const batchRenderer = particleSystemState.batchSystem.value
    useEffect(() => {
      component.system !== undefined && batchRenderer.remove(component.system.emitter)
      component.system !== undefined && component.system.dispose()
      const nuSystem = ParticleSystem.fromJSON(
        component.systemParameters,
        {
          textures: {},
          geometries: {}
        },
        {},
        batchRenderer
      )
      componentState.system.set(nuSystem)
    }, [componentState.systemParameters])

    return null
  }
})
