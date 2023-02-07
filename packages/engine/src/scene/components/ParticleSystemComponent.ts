import { useEffect } from 'react'
import { AdditiveBlending, Blending, BufferGeometry, Color, Object3D, Texture, TextureLoader, Vector4 } from 'three'
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

import { config } from '@xrengine/common/src/config'
import { OpaqueType } from '@xrengine/common/src/interfaces/OpaqueType'
import { getState, MatchesWithDefault, NO_PROXY, none } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AssetClass } from '../../assets/enum/AssetClass'
import {
  defineComponent,
  getComponent,
  getComponentState,
  hasComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { getBatchRenderer } from '../systems/ParticleSystemSystem'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'

/*
SHAPE TYPES
*/
export type PointShapeJSON = {
  type: 'point'
}

export const POINT_SHAPE_DEFAULT: PointShapeJSON = {
  type: 'point'
}

export type SphereShapeJSON = {
  type: 'sphere'
  radius?: number
}

export const SPHERE_SHAPE_DEFAULT: SphereShapeJSON = {
  type: 'sphere',
  radius: 1
}

export type ConeShapeJSON = {
  type: 'cone'
  radius?: number
  arc?: number
  thickness?: number
  angle?: number
}

export const CONE_SHAPE_DEFAULT: ConeShapeJSON = {
  type: 'cone',
  radius: 1,
  arc: 0.2,
  thickness: 4,
  angle: 30
}

export type DonutShapeJSON = {
  type: 'donut'
  radius?: number
  arc?: number
  thickness?: number
  angle?: number
}

export const DONUT_SHAPE_DEFAULT: DonutShapeJSON = {
  type: 'donut',
  radius: 1,
  arc: 30,
  thickness: 0.5,
  angle: 15
}

export type MeshShapeJSON = {
  type: 'mesh'
  mesh?: string
}

export const MESH_SHAPE_DEFAULT: MeshShapeJSON = {
  type: 'mesh',
  mesh: ''
}

export type GridShapeJSON = {
  type: 'grid'
  width?: number
  height?: number
  column?: number
  row?: number
}

export const GRID_SHAPE_DEFAULT: GridShapeJSON = {
  type: 'grid',
  width: 1,
  height: 1,
  column: 1,
  row: 1
}

export type EmitterShapeJSON =
  | PointShapeJSON
  | SphereShapeJSON
  | ConeShapeJSON
  | MeshShapeJSON
  | GridShapeJSON
  | DonutShapeJSON

/*
/SHAPE TYPES
*/

/*
VALUE GENERATOR TYPES
*/

export type ConstantValueJSON = {
  type: 'ConstantValue'
  value: number
}

export type IntervalValueJSON = {
  type: 'IntervalValue'
  a: number
  b: number
}

export type ConstantColorJSON = {
  type: 'ConstantColor'
  color: {
    r: number
    g: number
    b: number
    a: number
  }
}

/*
/VALUE GENERATOR TYPES
*/

export type BehaviorJSON = OpaqueType<'BehaviorJSON'> & { [field: string]: any }

export type ParticleSystemComponentType = {
  systemParameters: ParticleSystemJSONParameters
  behaviorParameters: BehaviorJSON[]

  system?: ParticleSystem | undefined
  behaviors?: Behavior[] | undefined
  _loadIndex: number
  _refresh: number
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
  startLife: {
    type: 'IntervalValue',
    a: 1,
    b: 2
  },
  startSpeed: {
    type: 'IntervalValue',
    a: 0.1,
    b: 5
  },
  startRotation: {
    type: 'IntervalValue',
    a: 0,
    b: 300
  },
  startSize: {
    type: 'IntervalValue',
    a: 0.025,
    b: 0.45
  },
  startColor: {
    type: 'ConstantColor',
    color: { r: 1, g: 1, b: 1, a: 0.1 }
  },
  emissionOverTime: {
    type: 'ConstantValue',
    value: 400
  },
  emissionOverDistance: {
    type: 'ConstantValue',
    value: 0
  },
  emissionBursts: [],
  onlyUsedByOther: false,
  rendererEmitterSettings: {
    startLength: undefined,
    followLocalOrigin: undefined
  },
  renderMode: RenderMode.BillBoard,
  texture: '/static/editor/dot.png',
  startTileIndex: 0,
  uTileCount: 1,
  vTileCount: 1,
  blending: AdditiveBlending,
  behaviors: [],
  worldSpace: true
}

export const SCENE_COMPONENT_PARTICLE_SYSTEM = 'particle-system'

export const ParticleSystemComponent = defineComponent({
  name: 'EE_ParticleSystem',
  onInit: (entity) => {
    return {
      systemParameters: DEFAULT_PARTICLE_SYSTEM_PARAMETERS,
      behaviorParameters: [],
      _loadIndex: 0,
      _refresh: 0
    } as ParticleSystemComponentType
  },
  onSet: (entity, component, json) => {
    if (!json) return

    !!json.systemParameters &&
      component.systemParameters.set({
        ...JSON.parse(JSON.stringify(component.systemParameters.value)),
        ...json.systemParameters
      })

    !!json.behaviorParameters && component.behaviorParameters.set(new Array(...json.behaviorParameters))
    ;(!!json.systemParameters || !!json.behaviorParameters) &&
      component._refresh.set((component._refresh.value + 1) % 1000)
  },
  onRemove: (entity, component) => {
    if (component.system.value) {
      removeObjectFromGroup(entity, component.system.value.emitter)
      component.system.get(NO_PROXY)?.dispose()
      component.system.set(none)
    }
    component.behaviors.set(none)
  },
  toJSON: (entity, component) => ({
    systemParameters: component.systemParameters.value,
    behaviorParameters: component.behaviorParameters.value
  }),
  reactor: function ({ root }: EntityReactorProps) {
    const entity = root.entity
    if (!hasComponent(entity, ParticleSystemComponent)) throw root.stop()
    const componentState = useComponent(entity, ParticleSystemComponent)
    const component = componentState.value
    const batchRenderer = getBatchRenderer()!
    useEffect(() => {
      if (component.system && component.system!.emitter.userData['_refresh'] === component._refresh) return
      if (component.system) {
        removeObjectFromGroup(entity, component.system.emitter)
        component.system.dispose()
        componentState.system.set(none)
      }
      if (
        component.systemParameters.texture &&
        AssetLoader.getAssetClass(component.systemParameters.texture) === AssetClass.Image
      ) {
        componentState._loadIndex.set(component._loadIndex + 1)
        const currentLoadIdx = component._loadIndex
        AssetLoader.load(component.systemParameters.texture, {}, (texture) => {
          if (currentLoadIdx !== component._loadIndex) return
          const nuSystem = ParticleSystem.fromJSON(
            component.systemParameters,
            {
              textures: { [component.systemParameters.texture]: texture },
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
          nuSystem.emitter.userData['_refresh'] = component._refresh
          addObjectToGroup(entity, nuSystem.emitter)
          componentState.system.set(nuSystem)
        })
      }
    }, [componentState._refresh])
    return null
  }
})
