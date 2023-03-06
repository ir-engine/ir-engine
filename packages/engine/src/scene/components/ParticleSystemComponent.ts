import { useEffect } from 'react'
import { AdditiveBlending, BufferGeometry, Texture } from 'three'
import { Behavior, BehaviorFromJSON, ParticleSystem, ParticleSystemJSONParameters, RenderMode } from 'three.quarks'
import matches from 'ts-matches'

import { NO_PROXY, none } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AssetClass } from '../../assets/enum/AssetClass'
import { GLTF } from '../../assets/loaders/gltf/GLTFLoader'
import { defineComponent, hasComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { getBatchRenderer } from '../systems/ParticleSystemSystem'
import getFirstMesh from '../util/getFirstMesh'
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
  type: 'mesh_surface'
  mesh?: string
}

export const MESH_SHAPE_DEFAULT: MeshShapeJSON = {
  type: 'mesh_surface',
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

export type PiecewiseBezierValueJSON = {
  type: 'PiecewiseBezier'
  functions: {
    function: {
      p0: number
      p1: number
      p2: number
      p3: number
    }
    start: number
  }[]
}

export type ValueGeneratorJSON = ConstantValueJSON | IntervalValueJSON | PiecewiseBezierValueJSON

export const ValueGeneratorJSONDefaults: Record<string, ValueGeneratorJSON> = {
  ConstantValue: {
    type: 'ConstantValue',
    value: 1
  },
  IntervalValue: {
    type: 'IntervalValue',
    a: 0,
    b: 1
  },
  PiecewiseBezier: {
    type: 'PiecewiseBezier',
    functions: [
      {
        function: {
          p0: 0,
          p1: 0,
          p2: 1,
          p3: 1
        },
        start: 0
      }
    ]
  }
}

/*
/VALUE GENERATOR TYPES
*/

/*
COLOR GENERATOR TYPES
*/

export type ColorJSON = {
  r: number
  g: number
  b: number
  a: number
}

export type ConstantColorJSON = {
  type: 'ConstantColor'
  color: ColorJSON
}

export type ColorRangeJSON = {
  type: 'ColorRange'
  a: ColorJSON
  b: ColorJSON
}

export type RandomColorJSON = {
  type: 'RandomColor'
  a: ColorJSON
  b: ColorJSON
}

export type ColorGradientJSON = {
  type: 'Gradient'
  functions: {
    function: ColorGeneratorJSON
    start: number
  }[]
}

export type ColorGeneratorJSON = ConstantColorJSON | ColorRangeJSON | RandomColorJSON | ColorGradientJSON

export const ColorGeneratorJSONDefaults: Record<string, ColorGeneratorJSON> = {
  ConstantColor: {
    type: 'ConstantColor',
    color: { r: 1, g: 1, b: 1, a: 1 }
  },
  ColorRange: {
    type: 'ColorRange',
    a: { r: 1, g: 1, b: 1, a: 1 },
    b: { r: 1, g: 1, b: 1, a: 1 }
  },
  RandomColor: {
    type: 'RandomColor',
    a: { r: 1, g: 1, b: 1, a: 1 },
    b: { r: 1, g: 1, b: 1, a: 1 }
  },
  Gradient: {
    type: 'Gradient',
    functions: []
  }
}

/*
/COLOR GENERATOR TYPES
*/

/*
ROTATION GENERATOR TYPES
*/

export type AxisAngleGeneratorJSON = {
  type: 'AxisAngle'
  axis: [number, number, number]
  angle: ValueGeneratorJSON
}

export type EulerGeneratorJSON = {
  type: 'Euler'
  angleX: ValueGeneratorJSON
  angleY: ValueGeneratorJSON
  angleZ: ValueGeneratorJSON
}

export type RandomQuatGeneratorJSON = {
  type: 'RandomQuat'
}

export type RotationGeneratorJSON = AxisAngleGeneratorJSON | EulerGeneratorJSON | RandomQuatGeneratorJSON

/*
/ROTATION GENERATOR TYPES
*/

/*
BEHAVIOR TYPES
*/

export type ApplyForceBehaviorJSON = {
  type: 'ApplyForce'
  direction: [number, number, number]
  magnitude: ValueGeneratorJSON
}

export type NoiseBehaviorJSON = {
  type: 'Noise'
  frequency: [number, number, number]
  power: [number, number, number]
}

export type TurbulenceFieldBehaviorJSON = {
  type: 'TurbulenceField'
  scale: [number, number, number]
  octaves: number
  velocityMultiplier: [number, number, number]
  timeScale: [number, number, number]
}

export type GravityForceBehaviorJSON = {
  type: 'GravityForce'
  center: [number, number, number]
  magnitude: number
}

export type ColorOverLifeBehaviorJSON = {
  type: 'ColorOverLife'
  color: ColorGeneratorJSON
}

export type RotationOverLifeBehaviorJSON = {
  type: 'RotationOverLife'
  angularVelocity: ValueGeneratorJSON
  dynamic: boolean
}

export type Rotation3DOverLifeBehaviorJSON = {
  type: 'Rotation3DOverLife'
  angularVelocity: RotationGeneratorJSON
  dynamic: boolean
}

export type SizeOverLifeBehaviorJSON = {
  type: 'SizeOverLife'
  size: ValueGeneratorJSON
}

export type SpeedOverLifeBehaviorJSON = {
  type: 'SpeedOverLife'
  speed: ValueGeneratorJSON
}

export type FrameOverLifeBehaviorJSON = {
  type: 'FrameOverLife'
  frame: ValueGeneratorJSON
}

export type ForceOverLifeBehaviorJSON = {
  type: 'ForceOverLife'
  x: ValueGeneratorJSON
  y: ValueGeneratorJSON
  z: ValueGeneratorJSON
}

export type OrbitOverLifeBehaviorJSON = {
  type: 'OrbitOverLife'
  orbitSpeed: ValueGeneratorJSON
  axis: [number, number, number]
}

export type WidthOverLengthBehaviorJSON = {
  type: 'WidthOverLength'
  width: ValueGeneratorJSON
}

export type ChangeEmitDirectionBehaviorJSON = {
  type: 'ChangeEmitDirection'
  angle: ValueGeneratorJSON
}

export type EmitSubParticleSystemBehaviorJSON = {
  type: 'EmitSubParticleSystem'
  subParticleSystem: string
  useVelocityAsBasis: boolean
}

export type BehaviorJSON =
  | ApplyForceBehaviorJSON
  | NoiseBehaviorJSON
  | TurbulenceFieldBehaviorJSON
  | GravityForceBehaviorJSON
  | ColorOverLifeBehaviorJSON
  | RotationOverLifeBehaviorJSON
  | Rotation3DOverLifeBehaviorJSON
  | SizeOverLifeBehaviorJSON
  | SpeedOverLifeBehaviorJSON
  | FrameOverLifeBehaviorJSON
  | ForceOverLifeBehaviorJSON
  | OrbitOverLifeBehaviorJSON
  | WidthOverLengthBehaviorJSON
  | ChangeEmitDirectionBehaviorJSON
  | EmitSubParticleSystemBehaviorJSON

export const BehaviorJSONDefaults: { [type: string]: BehaviorJSON } = {
  ApplyForce: {
    type: 'ApplyForce',
    direction: [0, 1, 0],
    magnitude: {
      type: 'ConstantValue',
      value: 1
    }
  },
  Noise: {
    type: 'Noise',
    frequency: [1, 1, 1],
    power: [1, 1, 1]
  },
  TurbulenceField: {
    type: 'TurbulenceField',
    scale: [1, 1, 1],
    octaves: 3,
    velocityMultiplier: [1, 1, 1],
    timeScale: [1, 1, 1]
  },
  GravityForce: {
    type: 'GravityForce',
    center: [0, 0, 0],
    magnitude: 1
  },
  ColorOverLife: {
    type: 'ColorOverLife',
    color: {
      type: 'ConstantColor',
      color: {
        r: 1,
        g: 1,
        b: 1,
        a: 1
      }
    }
  },
  RotationOverLife: {
    type: 'RotationOverLife',
    angularVelocity: {
      type: 'ConstantValue',
      value: 0.15
    },
    dynamic: false
  },
  Rotation3DOverLife: {
    type: 'Rotation3DOverLife',
    angularVelocity: {
      type: 'RandomQuat'
    },
    dynamic: false
  },
  SizeOverLife: {
    type: 'SizeOverLife',
    size: {
      type: 'ConstantValue',
      value: 0
    }
  },
  SpeedOverLife: {
    type: 'SpeedOverLife',
    speed: {
      type: 'ConstantValue',
      value: 1
    }
  },
  FrameOverLife: {
    type: 'FrameOverLife',
    frame: {
      type: 'ConstantValue',
      value: 0
    }
  },
  ForceOverLife: {
    type: 'ForceOverLife',
    x: {
      type: 'ConstantValue',
      value: 0
    },
    y: {
      type: 'ConstantValue',
      value: 1
    },
    z: {
      type: 'ConstantValue',
      value: 0
    }
  },
  OrbitOverLife: {
    type: 'OrbitOverLife',
    orbitSpeed: {
      type: 'ConstantValue',
      value: 0
    },
    axis: [0, 1, 0]
  },
  WidthOverLength: {
    type: 'WidthOverLength',
    width: {
      type: 'ConstantValue',
      value: 1
    }
  },
  ChangeEmitDirection: {
    type: 'ChangeEmitDirection',
    angle: {
      type: 'ConstantValue',
      value: 1.4
    }
  },
  EmitSubParticleSystem: {
    type: 'EmitSubParticleSystem',
    subParticleSystem: '',
    useVelocityAsBasis: false
  }
}

/*
/BEHAVIOR TYPES
*/

export type ExpandedSystemJSON = ParticleSystemJSONParameters & {
  instancingGeometry?: string
  startColor: ColorGeneratorJSON
  startRotation: ValueGeneratorJSON
  startSize: ValueGeneratorJSON
  startSpeed: ValueGeneratorJSON
  startLife: ValueGeneratorJSON
  behaviors: BehaviorJSON[]
}

export type ParticleSystemComponentType = {
  systemParameters: ExpandedSystemJSON
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
  rendererEmitterSettings: matches
    .shape({
      startLength: matches.object.optional(),
      followLocalOrigin: matches.boolean.optional()
    })
    .optional(),
  renderMode: matches.natural,
  texture: matches.string,
  instancingGeometry: matches.object.optional(),
  startTileIndex: matches.natural,
  uTileCount: matches.natural,
  vTileCount: matches.natural,
  blending: matches.natural,
  behaviors: matches.arrayOf(matches.any),
  worldSpace: matches.boolean
})

export const DEFAULT_PARTICLE_SYSTEM_PARAMETERS: ExpandedSystemJSON = {
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
  instancingGeometry: undefined,
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
    !!json?.systemParameters &&
      component.systemParameters.set({
        ...JSON.parse(JSON.stringify(component.systemParameters.value)),
        ...json.systemParameters
      })

    !!json?.behaviorParameters && component.behaviorParameters.set(JSON.parse(JSON.stringify(json.behaviorParameters)))
    ;(!!json?.systemParameters || !!json?.behaviorParameters) &&
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
      function initParticleSystem(
        systemParameters: ParticleSystemJSONParameters,
        dependencies: {
          textures: { [key: string]: Texture }
          geometries: { [key: string]: BufferGeometry }
        }
      ) {
        const nuSystem = ParticleSystem.fromJSON(systemParameters, dependencies, {}, batchRenderer)
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
      }

      const doLoadEmissionGeo =
        component.systemParameters.shape.type === 'mesh_surface' &&
        AssetLoader.getAssetClass(component.systemParameters.shape.mesh ?? '') === AssetClass.Model

      const doLoadInstancingGeo =
        component.systemParameters.instancingGeometry &&
        AssetLoader.getAssetClass(component.systemParameters.instancingGeometry) === AssetClass.Model

      const doLoadTexture =
        component.systemParameters.texture &&
        AssetLoader.getAssetClass(component.systemParameters.texture) === AssetClass.Image

      const loadDependencies: Promise<any>[] = []
      const metadata: {
        textures: { [key: string]: Texture }
        geometries: { [key: string]: BufferGeometry }
      } = { textures: {}, geometries: {} }

      const processedParms = JSON.parse(JSON.stringify(component.systemParameters))

      function loadGeoDependency(src: string) {
        return new Promise((resolve) => {
          AssetLoader.load(src, {}, ({ scene }: GLTF) => {
            const geo = getFirstMesh(scene)?.geometry
            !!geo && (metadata.geometries[src] = geo)
            resolve(null)
          })
        })
      }

      doLoadEmissionGeo &&
        loadDependencies.push(
          new Promise((resolve) => {
            AssetLoader.load(component.systemParameters.shape.mesh!, {}, ({ scene }: GLTF) => {
              const mesh = getFirstMesh(scene)
              !!mesh && (processedParms.shape.mesh = mesh)
              resolve(null)
            })
          })
        )

      doLoadInstancingGeo && loadDependencies.push(loadGeoDependency(component.systemParameters.instancingGeometry!))

      doLoadTexture &&
        loadDependencies.push(
          new Promise((resolve) => {
            AssetLoader.load(component.systemParameters.texture, {}, (texture) => {
              metadata.textures[component.systemParameters.texture] = texture
              resolve(null)
            })
          })
        )

      componentState._loadIndex.set(componentState._loadIndex.value + 1)
      const currentIndex = componentState._loadIndex.value
      Promise.all(loadDependencies).then(() => {
        currentIndex === componentState._loadIndex.value && initParticleSystem(processedParms, metadata)
      })
    }, [componentState._refresh])
    return null
  }
})
