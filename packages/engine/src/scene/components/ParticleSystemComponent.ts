/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import {
  AdditiveBlending,
  Blending,
  BufferGeometry,
  CustomBlending,
  DoubleSide,
  Material,
  Matrix4,
  MeshBasicMaterial,
  MultiplyBlending,
  NoBlending,
  NormalBlending,
  Object3D,
  SubtractiveBlending,
  Texture,
  Vector2,
  Vector3
} from 'three'
import {
  BatchedRenderer,
  Behavior,
  BehaviorFromJSON,
  ParticleSystem,
  ParticleSystemJSONParameters,
  RenderMode
} from 'three.quarks'

import {
  Entity,
  EntityTreeComponent,
  UUIDComponent,
  createEntity,
  generateEntityUUID,
  getAncestorWithComponents,
  getChildrenWithComponents,
  removeEntity,
  useAncestorWithComponents,
  useEntityContext
} from '@ir-engine/ecs'
import {
  defineComponent,
  entityExists,
  getComponent,
  removeComponent,
  setComponent,
  useComponent,
  useHasComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { AssetType } from '@ir-engine/engine/src/assets/constants/AssetType'
import { NO_PROXY, defineState, getMutableState, none, useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Vector3_One } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { useGLTFComponent, useTexture } from '../../assets/functions/resourceLoaderHooks'
import { mergeGeometries } from '../util/meshUtils'
import { SourceComponent } from './SourceComponent'

export type ParticleSystemRendererInstance = {
  renderer: BatchedRenderer
  rendererEntity: Entity
  instanceCount: number
}

const createBatchedRenderer = (entity: Entity) => {
  const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
  const particleState = getMutableState(ParticleState)
  if (particleState.renderers[sceneEntity].value) {
    const instance = particleState.renderers[sceneEntity].get(NO_PROXY) as ParticleSystemRendererInstance
    instance.instanceCount++
    return instance
  } else {
    const renderer = new BatchedRenderer()
    const rendererEntity = createEntity()
    setComponent(rendererEntity, UUIDComponent, generateEntityUUID())
    setComponent(rendererEntity, VisibleComponent)
    setComponent(rendererEntity, NameComponent, 'Particle Renderer')
    const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
    setComponent(rendererEntity, EntityTreeComponent, { parentEntity: sceneEntity })
    renderer.preserveChildren = true
    renderer.parent = {
      type: 'Scene',
      remove: () => {},
      removeFromParent: () => {}
    } as Object3D
    renderer.matrixWorld = new Matrix4().identity()
    setComponent(rendererEntity, ObjectComponent, renderer)
    const instance: ParticleSystemRendererInstance = { renderer, rendererEntity, instanceCount: 1 }
    particleState.renderers[sceneEntity].set(instance)
    return instance
  }
}

const removeBatchedRenderer: (sceneID: string) => void = (sceneID) => {
  const particleState = getMutableState(ParticleState)
  if (particleState.renderers[sceneID].value) {
    const instance = particleState.renderers[sceneID].get(NO_PROXY) as ParticleSystemRendererInstance
    if (instance.instanceCount <= 1) {
      removeComponent(instance.rendererEntity, ObjectComponent)
      for (const batch of instance.renderer.batches) {
        batch.geometry.dispose()
        batch.dispose()
      }
      removeEntity(instance.rendererEntity)
      particleState.renderers[sceneID].set(none)
    } else {
      instance.instanceCount--
    }
  }
}

export const ParticleState = defineState({
  name: 'ParticleState',
  initial: () => ({
    renderers: {} as Record<Entity, ParticleSystemRendererInstance>
  })
})

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
  geometry: BufferGeometry
}

export const MESH_SHAPE_DEFAULT: MeshShapeJSON = {
  type: 'mesh_surface',
  mesh: '',
  geometry: new BufferGeometry()
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

export type BezierFunctionJSON = {
  function: {
    p0: number
    p1: number
    p2: number
    p3: number
  }
  start: number
}

export type PiecewiseBezierValueJSON = {
  type: 'PiecewiseBezier'
  functions: BezierFunctionJSON[]
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

export type ColorGradientFunctionJSON = {
  function: ColorRangeJSON
  start: number
}

export type ColorGradientJSON = {
  type: 'Gradient'
  functions: ColorGradientFunctionJSON[]
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
    functions: [
      {
        function: {
          type: 'ColorRange',
          a: { r: 1, g: 1, b: 1, a: 1 },
          b: { r: 1, g: 1, b: 1, a: 1 }
        },
        start: 0
      }
    ]
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

export const RotationGeneratorJSONDefaults: Record<string, RotationGeneratorJSON> = {
  AxisAngle: {
    type: 'AxisAngle',
    axis: [0, 1, 0],
    angle: {
      type: 'ConstantValue',
      value: 0
    }
  },
  Euler: {
    type: 'Euler',
    angleX: {
      type: 'ConstantValue',
      value: 0
    },
    angleY: {
      type: 'ConstantValue',
      value: 0
    },
    angleZ: {
      type: 'ConstantValue',
      value: 0
    }
  },
  RandomQuat: {
    type: 'RandomQuat'
  }
}
/*
/ROTATION GENERATOR TYPES
*/

/*
BEHAVIOR TYPES
*/

//  SEQUENCER
export type TextureSequencerJSON = {
  scaleX: number
  scaleY: number
  position: Vector3
  locations: Vector2[]
  src: string
  threshold: number
}

export type SequencerJSON = TextureSequencerJSON

export type ApplySequencesJSON = {
  type: 'ApplySequences'
  delay: number
  sequencers: {
    range: IntervalValueJSON
    sequencer: SequencerJSON
  }[]
}

export type BurstParametersJSON = {
  time: number
  count: number
  cycle: number
  interval: number
  probability: number
}
//  /SEQUENCER

export type ApplyForceBehaviorJSON = {
  type: 'ApplyForce'
  direction: [number, number, number]
  magnitude: ValueGeneratorJSON
}

export type NoiseBehaviorJSON = {
  type: 'Noise'
  frequency: [number, number, number]
  power: [number, number, number]
  positionAmount: number
  rotationAmount: number
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
  | ApplySequencesJSON

/*
  SYSTEM TYPES
*/

export type RendererSettingsJSON = {
  startLength: ValueGeneratorJSON
  followLocalOrigin: boolean
}

export const BehaviorJSONDefaults: { [type: string]: BehaviorJSON } = {
  ApplySequences: {
    type: 'ApplySequences',
    delay: 0,
    sequencers: []
  },
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
    power: [1, 1, 1],
    positionAmount: 0,
    rotationAmount: 0
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
    magnitude: 10
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

const BlendingSchema = S.LiteralUnion(
  [NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending, CustomBlending],
  { default: AdditiveBlending }
)

export const DEFAULT_PARTICLE_SYSTEM_PARAMETERS = S.Object({
  version: S.String({ default: '1.0' }),
  autoDestroy: S.Bool({ default: false }),
  looping: S.Bool({ default: true }),
  prewarm: S.Bool({ default: false }),
  material: S.String({ default: '' }),
  transparent: S.Optional(S.Bool()),
  duration: S.Number({ default: 5 }),
  shape: S.Object({
    type: S.String({ default: 'point' }),
    mesh: S.Optional(S.String()),
    geometry: S.Optional(S.String())
  }),
  startLife: S.Object({
    type: S.String({ default: 'IntervalValue' }),
    a: S.Number({ default: 1 }),
    b: S.Number({ default: 2 }),
    value: S.Number({ default: 1 }),
    functions: S.Array(S.Type<BezierFunctionJSON>())
  }),
  startSpeed: S.Object({
    type: S.String({ default: 'IntervalValue' }),
    a: S.Number({ default: 0.1 }),
    b: S.Number({ default: 5 }),
    value: S.Number({ default: 1 }),
    functions: S.Array(S.Type<BezierFunctionJSON>())
  }),
  startRotation: S.Object({
    type: S.String({ default: 'IntervalValue' }),
    a: S.Number({ default: 0 }),
    b: S.Number({ default: 300 }),
    value: S.Number({ default: 1 }),
    functions: S.Array(S.Type<BezierFunctionJSON>())
  }),
  startSize: S.Object({
    type: S.String({ default: 'IntervalValue' }),
    a: S.Number({ default: 0.025 }),
    b: S.Number({ default: 0.45 }),
    value: S.Number({ default: 1 }),
    functions: S.Array(S.Type<BezierFunctionJSON>())
  }),
  startColor: S.Object({
    type: S.String({ default: 'ConstantColor' }),
    color: S.Object({
      r: S.Number({ default: 1 }),
      g: S.Number({ default: 1 }),
      b: S.Number({ default: 1 }),
      a: S.Number({ default: 0.1 })
    }),
    a: S.Object({
      r: S.Number({ default: 1 }),
      g: S.Number({ default: 1 }),
      b: S.Number({ default: 1 }),
      a: S.Number({ default: 1 })
    }),
    b: S.Object({
      r: S.Number({ default: 1 }),
      g: S.Number({ default: 1 }),
      b: S.Number({ default: 1 }),
      a: S.Number({ default: 1 })
    }),
    functions: S.Array(S.Type<ColorGradientFunctionJSON>())
  }),
  emissionOverTime: S.Object({
    type: S.String({ default: 'ConstantValue' }),
    value: S.Number({ default: 400 }),
    a: S.Number({ default: 0 }),
    b: S.Number({ default: 1 }),
    functions: S.Array(S.Type<BezierFunctionJSON>())
  }),
  emissionOverDistance: S.Object({
    type: S.String({ default: 'ConstantValue' }),
    value: S.Number({ default: 0 }),
    a: S.Number({ default: 0 }),
    b: S.Number({ default: 1 }),
    functions: S.Array(S.Type<BezierFunctionJSON>())
  }),
  emissionBursts: S.Array(
    S.Object({
      time: S.Number(),
      count: S.Number(),
      cycle: S.Number(),
      interval: S.Number(),
      probability: S.Number()
    })
  ),
  onlyUsedByOther: S.Bool({ default: false }),
  rendererEmitterSettings: S.Object({
    startLength: S.Object({
      type: S.String({ default: 'ConstantValue' }),
      value: S.Number({ default: 1 }),
      a: S.Number({ default: 0 }),
      b: S.Number({ default: 1 }),
      functions: S.Array(S.Type<BezierFunctionJSON>())
    }),
    followLocalOrigin: S.Bool({ default: true })
  }),
  renderMode: S.Enum(RenderMode, { default: RenderMode.BillBoard }),
  texture: S.String({ default: '' }),
  /**
   * particle mesh geometry
   */
  instancingGeometry: S.String({ default: '' }),
  startTileIndex: S.Object({
    type: S.String({ default: 'ConstantValue' }),
    value: S.Number({ default: 0 }),
    a: S.Number({ default: 0 }),
    b: S.Number({ default: 1 }),
    functions: S.Array(S.Type<BezierFunctionJSON>())
  }),
  uTileCount: S.Number({ default: 1 }),
  vTileCount: S.Number({ default: 1 }),
  blending: BlendingSchema,
  behaviors: S.Array(S.Type<BehaviorJSON>()),
  worldSpace: S.Bool({ default: true })
})

export const ParticleSystemComponent = defineComponent({
  name: 'ParticleSystemComponent',
  jsonID: 'EE_particle_system',

  schema: S.Object({
    systemParameters: DEFAULT_PARTICLE_SYSTEM_PARAMETERS,
    behaviorParameters: S.Array(S.Type<BehaviorJSON>()),
    behaviors: S.Optional(S.Array(S.Type<Behavior>()), { serialized: false }),
    system: S.Type<ParticleSystem>({ serialized: false } as any)
  }),

  onSet: (entity, component, json) => {
    !!json?.systemParameters &&
      component.systemParameters.set({
        ...JSON.parse(JSON.stringify(component.systemParameters.value)),
        ...json.systemParameters
      })

    !!json?.behaviorParameters && component.behaviorParameters.set(JSON.parse(JSON.stringify(json.behaviorParameters)))
  },

  toJSON: (component) => ({
    systemParameters: JSON.parse(JSON.stringify(component.systemParameters)),
    behaviorParameters: JSON.parse(JSON.stringify(component.behaviorParameters))
  }),

  reactor: function () {
    const entity = useEntityContext()
    const componentState = useComponent(entity, ParticleSystemComponent)
    const metadata = useHookstate({ textures: {}, geometries: {}, materials: {} } as ParticleSystemMetadata)
    const sceneID = useOptionalComponent(entity, SourceComponent)?.value

    //for particle meshes
    const geoDependencyEntity = useGLTFComponent(componentState.value.systemParameters.instancingGeometry, entity)

    /** @todo track this in resource manager */
    const dudMaterial = useHookstate(
      () =>
        new MeshBasicMaterial({
          color: 0xff0000,
          transparent: componentState.value.systemParameters.transparent ?? true,
          blending: componentState.value.systemParameters.blending as Blending,
          side: DoubleSide
        })
    ).value as MeshBasicMaterial

    useEffect(() => {
      //add dud material
      componentState.systemParameters.material.set('dud')
      metadata.materials.nested('dud').set(dudMaterial)
    }, [])

    //for particle meshes
    useEffect(() => {
      if (!geoDependencyEntity) return
      const meshEntity = getChildrenWithComponents(geoDependencyEntity, [MeshComponent])[0]
      if (!meshEntity) return

      const mesh = getComponent(meshEntity, MeshComponent)
      const scaledGeometry = mesh.geometry.clone()
      const scale = getNestedScale(mesh)
      scaledGeometry.scale(scale.x, scale.y, scale.z)
      if (scaledGeometry) {
        metadata.geometries.nested(componentState.value.systemParameters.instancingGeometry).set(scaledGeometry)

        return () => {
          metadata.geometries.nested(componentState.value.systemParameters.instancingGeometry).set(none)
        }
      }
    }, [geoDependencyEntity])

    //for mesh shape emitters
    const shapeMeshEntity = useGLTFComponent(componentState.value.systemParameters.shape.mesh ?? '', entity)

    //for mesh shape emitters
    useEffect(() => {
      if (!shapeMeshEntity) return
      const meshEntities = getChildrenWithComponents(shapeMeshEntity, [MeshComponent])
      if (!meshEntities.length) return

      const meshes = meshEntities.map((entity) => getComponent(entity, MeshComponent))

      const geometries = meshes.map((mesh) => {
        const scaledGeometry = mesh.geometry.clone()
        const scale = getNestedScale(mesh)
        scaledGeometry.scale(scale.x, scale.y, scale.z)
        return scaledGeometry
      })
      const mergedGeometry = mergeGeometries(geometries)

      if (mergedGeometry) {
        componentState.systemParameters.shape.geometry.set(componentState.value.systemParameters.shape.mesh!)
        metadata.geometries.nested(componentState.value.systemParameters.shape.mesh!).set(mergedGeometry)

        return () => {
          metadata.geometries.nested(componentState.value.systemParameters.shape.mesh!).set(none)
        }
      }
    }, [shapeMeshEntity])

    const [texture] = useTexture(componentState.value.systemParameters.texture!, entity, (url) => {
      if (!entityExists(entity)) return
      metadata.textures.nested(url).set(none)
      dudMaterial.map = null
    })

    useEffect(() => {
      if (!texture) return
      metadata.textures.nested(componentState.value.systemParameters.texture!).set(texture)
      dudMaterial.map = texture
      dudMaterial.needsUpdate = true
    }, [texture])

    const doLoadEmissionGeo =
      componentState.systemParameters.shape.type.value === 'mesh_surface' &&
      AssetLoader.getAssetClass(componentState.systemParameters.shape.mesh.value ?? '') === AssetType.Model

    const doLoadInstancingGeo =
      componentState.systemParameters.instancingGeometry.value &&
      AssetLoader.getAssetClass(componentState.systemParameters.instancingGeometry.value) === AssetType.Model

    const doLoadTexture =
      componentState.systemParameters.texture.value &&
      AssetLoader.getAssetClass(componentState.systemParameters.texture.value) === AssetType.Image

    const loadedEmissionGeo = !!shapeMeshEntity || !doLoadEmissionGeo
    const loadedInstanceGeo = !!geoDependencyEntity || !doLoadInstancingGeo
    const loadedTexture = !!texture || !doLoadTexture

    const dependenciesLoaded = loadedEmissionGeo && loadedInstanceGeo && loadedTexture

    const sceneEntity = useAncestorWithComponents(entity, [SceneComponent])
    const visible = useHasComponent(entity, VisibleComponent)

    useEffect(() => {
      if (!dependenciesLoaded || !sceneEntity || !visible) return

      const component = componentState.get(NO_PROXY)
      const rendererInstance = createBatchedRenderer(entity)
      const renderer = rendererInstance.renderer

      const systemParameters = JSON.parse(JSON.stringify(component.systemParameters)) as ExpandedSystemJSON
      const nuSystem = ParticleSystem.fromJSON(systemParameters, metadata.value as ParticleSystemMetadata, {})
      renderer.addSystem(nuSystem)
      const behaviors = component.behaviorParameters.map((behaviorJSON) => {
        const behavior = BehaviorFromJSON(behaviorJSON, nuSystem)
        nuSystem.addBehavior(behavior)
        return behavior
      })
      componentState.behaviors.set(behaviors)

      const emitterAsObj3D = nuSystem.emitter
      emitterAsObj3D.parent = renderer
      setComponent(entity, ObjectComponent, emitterAsObj3D)
      // quarks expects the parent property on the emitter object to be the renderer, otherwise it will dispose the emitter
      Object.defineProperties(emitterAsObj3D, {
        parent: {
          get() {
            return renderer
          },
          set(value) {
            if (value != undefined) throw new Error('Cannot set parent of proxified object')
            console.warn('Setting to nil value is not supported ObjectComponent.ts')
          }
        }
      })
      setComponent(entity, EntityTreeComponent, { parentEntity: renderer.entity })
      const transformComponent = getComponent(entity, TransformComponent)
      emitterAsObj3D.matrix = transformComponent.matrix
      componentState.system.set(nuSystem)

      return () => {
        const index = renderer.systemToBatchIndex.get(nuSystem)
        if (typeof index !== 'undefined') {
          renderer.deleteSystem(nuSystem)
          renderer.children.splice(index, 1)
          const [batch] = renderer.batches.splice(index, 1)
          batch.dispose()
          renderer.systemToBatchIndex.clear()
          for (let i = 0; i < renderer.batches.length; i++) {
            for (const system of renderer.batches[i].systems) {
              renderer.systemToBatchIndex.set(system, i)
            }
          }
        }
        removeComponent(entity, ObjectComponent)
        if (entityExists(entity)) setComponent(entity, ObjectComponent, new Object3D())

        nuSystem.dispose()
        emitterAsObj3D.dispose()
        removeBatchedRenderer(sceneID!)
      }
    }, [componentState.systemParameters, componentState.behaviorParameters, dependenciesLoaded, sceneEntity, visible])

    return null
  }
})

function getNestedScale(node: Object3D): Vector3 {
  const scale = node.scale?.clone() ?? Vector3_One

  if (node.parent) {
    scale.multiply(getNestedScale(node.parent))
  }

  return scale
}
