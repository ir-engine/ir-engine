import { useEffect } from 'react'
import { AdditiveBlending, Blending, BufferGeometry, Color, Texture, TextureLoader, Vector4 } from 'three'
import {
  Behavior,
  BehaviorFromJSON,
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

import { OpaqueType } from '@xrengine/common/src/interfaces/OpaqueType'
import { getState, MatchesWithDefault, NO_PROXY, none } from '@xrengine/hyperflux'

import { defineComponent, getComponent, getComponentState, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { getBatchRenderer } from '../systems/ParticleSystemSystem'

export type BehaviorJSON = OpaqueType<'BehaviorJSON'> & { [field: string]: any }

export type ParticleSystemComponentType = {
  systemParameters: ParticleSystemJSONParameters
  behaviorParameters: BehaviorJSON[]

  system?: ParticleSystem | undefined
  behaviors?: Behavior[] | undefined
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
  version: '1.0',
  autoDestroy: false,
  looping: true,
  duration: 5,
  shape: { type: 'point' },
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
  texture: '/static/dot.png',
  startTileIndex: 0,
  uTileCount: 1,
  vTileCount: 1,
  blending: 0,
  behaviors: [],
  worldSpace: true
}

export const SCENE_COMPONENT_PARTICLE_SYSTEM = 'particle-system'

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
    !!json.behaviorParameters && component.behaviorParameters.set(new Array(...json.behaviorParameters))
  },
  onRemove: (entity, component) => {
    if (component.system.value) {
      const batchRenderer = getBatchRenderer()!
      batchRenderer.remove(component.system.value.emitter)
      component.system.value.dispose()
      component.system.set(none)
    }
    component.behaviors.set(none)
  },
  reactor: function ({ root }: EntityReactorProps) {
    const entity = root.entity
    if (!hasComponent(entity, ParticleSystemComponent)) throw root.stop()
    const component = getComponent(entity, ParticleSystemComponent)
    const componentState = getComponentState(entity, ParticleSystemComponent)
    const batchRenderer = getBatchRenderer()!
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
      componentState.behaviors.set(
        component.behaviorParameters.map((behaviorJSON) => {
          const behavior = BehaviorFromJSON(behaviorJSON, nuSystem)
          nuSystem.addBehavior(behavior)
          return behavior
        })
      )
      componentState.system.set(nuSystem)
    }, [componentState.systemParameters, componentState.behaviorParameters])
    return null
  }
})
