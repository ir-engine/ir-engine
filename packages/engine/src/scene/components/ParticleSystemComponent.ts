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
import matches from 'ts-matches'

import { Entity, UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity, generateEntityUUID, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { AssetType } from '@ir-engine/engine/src/assets/constants/AssetType'
import {
  NO_PROXY,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  none,
  useHookstate
} from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Vector3_One } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { useDisposable } from '@ir-engine/spatial/src/resources/resourceHooks'
import { EntityTreeComponent, getChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { useGLTFComponent, useTexture } from '../../assets/functions/resourceLoaderHooks'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { GLTFSnapshotAction } from '../../gltf/GLTFDocumentState'
import { GLTFSnapshotState, GLTFSourceState } from '../../gltf/GLTFState'
import { mergeGeometries } from '../util/meshUtils'
import { SourceComponent } from './SourceComponent'

export type ParticleSystemRendererInstance = {
  renderer: BatchedRenderer
  rendererEntity: Entity
  instanceCount: number
}

const createBatchedRenderer: (sceneID: string) => ParticleSystemRendererInstance = (sceneID) => {
  const particleState = getMutableState(ParticleState)
  if (particleState.renderers[sceneID].value) {
    const instance = particleState.renderers[sceneID].get(NO_PROXY) as ParticleSystemRendererInstance
    instance.instanceCount++
    return instance
  } else {
    const renderer = new BatchedRenderer()
    const rendererEntity = createEntity()
    setComponent(rendererEntity, UUIDComponent, generateEntityUUID())
    setComponent(rendererEntity, VisibleComponent)
    setComponent(rendererEntity, NameComponent, 'Particle Renderer')
    const sourceState = getState(GLTFSourceState)
    setComponent(rendererEntity, EntityTreeComponent, { parentEntity: sourceState[sceneID] })
    addObjectToGroup(rendererEntity, renderer)
    renderer.parent = {
      type: 'Scene',
      remove: () => {},
      removeFromParent: () => {}
    } as Object3D
    renderer.matrixWorld = new Matrix4().identity()
    const instance: ParticleSystemRendererInstance = { renderer, rendererEntity, instanceCount: 1 }
    particleState.renderers[sceneID].set(instance)
    return instance
  }
}

const removeBatchedRenderer: (sceneID: string) => void = (sceneID) => {
  const particleState = getMutableState(ParticleState)
  if (particleState.renderers[sceneID].value) {
    const instance = particleState.renderers[sceneID].get(NO_PROXY) as ParticleSystemRendererInstance
    if (instance.instanceCount <= 1) {
      removeObjectFromGroup(instance.rendererEntity, instance.renderer)
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
    renderers: {} as Record<string, ParticleSystemRendererInstance>
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
  speedFactor: matches.number,
  texture: matches.string,
  instancingGeometry: matches.object.optional(),
  startTileIndex: matches.natural,
  uTileCount: matches.natural,
  vTileCount: matches.natural,
  blending: matches.natural,
  behaviors: matches.arrayOf(matches.any),
  worldSpace: matches.boolean
})

const BlendingSchema = S.LiteralUnion(
  [NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending, CustomBlending],
  AdditiveBlending
)

export const DEFAULT_PARTICLE_SYSTEM_PARAMETERS = S.Object({
  version: S.String('1.0'),
  autoDestroy: S.Bool(false),
  looping: S.Bool(true),
  prewarm: S.Bool(false),
  material: S.String(''),
  transparent: S.Optional(S.Bool()),
  duration: S.Number(5),
  shape: S.Object({ type: S.String('point'), mesh: S.Optional(S.String()), geometry: S.Optional(S.String()) }),
  startLife: S.Object({
    type: S.String('IntervalValue'),
    a: S.Number(1),
    b: S.Number(2)
  }),
  startSpeed: S.Object({
    type: S.String('IntervalValue'),
    a: S.Number(0.1),
    b: S.Number(5)
  }),
  startRotation: S.Object({
    type: S.String('IntervalValue'),
    a: S.Number(0),
    b: S.Number(300)
  }),
  startSize: S.Object({
    type: S.String('IntervalValue'),
    a: S.Number(0.025),
    b: S.Number(0.45)
  }),
  startColor: S.Object({
    type: S.String('ConstantColor'),
    color: S.Object({ r: S.Number(1), g: S.Number(1), b: S.Number(1), a: S.Number(0.1) })
  }),
  emissionOverTime: S.Object({
    type: S.String('ConstantValue'),
    value: S.Number(400)
  }),
  emissionOverDistance: S.Object({
    type: S.String('ConstantValue'),
    value: S.Number(0)
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
  onlyUsedByOther: S.Bool(false),
  rendererEmitterSettings: S.Object({
    startLength: S.Object({
      type: S.String('ConstantValue'),
      value: S.Number(1)
    }),
    followLocalOrigin: S.Bool(true)
  }),
  renderMode: S.Enum(RenderMode, RenderMode.BillBoard),
  texture: S.String('/static/editor/dot.png'),
  /**
   * particle mesh geometry
   */
  instancingGeometry: S.String(''),
  startTileIndex: S.Object({
    type: S.String('ConstantValue'),
    value: S.Number(0)
  }),
  uTileCount: S.Number(1),
  vTileCount: S.Number(1),
  blending: BlendingSchema,
  behaviors: S.Array(S.Type<BehaviorJSON>()),
  worldSpace: S.Bool(true)
})

export const ParticleSystemComponent = defineComponent({
  name: 'ParticleSystemComponent',
  jsonID: 'EE_particle_system',

  schema: S.Object({
    systemParameters: DEFAULT_PARTICLE_SYSTEM_PARAMETERS,
    behaviorParameters: S.Array(S.Type<BehaviorJSON>()),
    behaviors: S.NonSerialized(S.Optional(S.Array(S.Type<Behavior>()))),
    system: S.NonSerialized(S.Type<ParticleSystem>()),
    _loadIndex: S.NonSerialized(S.Number(0)),
    _refresh: S.NonSerialized(S.Number(0))
  }),

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

  toJSON: (component) => ({
    systemParameters: JSON.parse(JSON.stringify(component.systemParameters)),
    behaviorParameters: JSON.parse(JSON.stringify(component.behaviorParameters))
  }),

  reactor: function () {
    const entity = useEntityContext()
    const componentState = useComponent(entity, ParticleSystemComponent)
    const metadata = useHookstate({ textures: {}, geometries: {}, materials: {} } as ParticleSystemMetadata)
    const sceneID = useOptionalComponent(entity, SourceComponent)?.value
    const rootEntity = useHookstate(getMutableState(GLTFSourceState))[sceneID ?? ''].value
    const gltfComponent = useOptionalComponent(rootEntity, GLTFComponent)
    const refreshed = useHookstate(false)

    //for particle meshes
    const geoDependencyEntity = useGLTFComponent(componentState.value.systemParameters.instancingGeometry, entity)

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
      metadata.textures.nested(url).set(none)
      dudMaterial.map = null
    })

    const [dudMaterial] = useDisposable(MeshBasicMaterial, entity, {
      color: 0xffffff,
      transparent: componentState.value.systemParameters.transparent ?? true,
      blending: componentState.value.systemParameters.blending as Blending,
      side: DoubleSide
    })

    //@todo: this is a hack to make trail rendering mode work correctly. We need to find out why an additional snapshot is needed
    useEffect(() => {
      if (gltfComponent?.value && !GLTFComponent.isSceneLoaded(rootEntity)) return
      if (refreshed.value) return

      //if (componentState.systemParameters.renderMode.value === RenderMode.Trail) {
      const snapshot = GLTFSnapshotState.cloneCurrentSnapshot(sceneID!)
      dispatchAction(GLTFSnapshotAction.createSnapshot(snapshot))
      //}
      refreshed.set(true)
    }, [gltfComponent?.progress])

    useEffect(() => {
      //add dud material
      componentState.systemParameters.material.set('dud')
      metadata.materials.nested('dud').set(dudMaterial)
    }, [])

    useEffect(() => {
      if (!texture) return
      metadata.textures.nested(componentState.value.systemParameters.texture!).set(texture)
      dudMaterial.map = texture
      dudMaterial.needsUpdate = true
    }, [texture])

    useEffect(() => {
      // loadIndex of 0 means particle system dependencies haven't loaded yet
      if (!componentState._loadIndex.value) return

      const component = componentState.get(NO_PROXY)
      const rendererInstance = createBatchedRenderer(sceneID!)
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
      emitterAsObj3D.userData['_refresh'] = component._refresh
      addObjectToGroup(entity, emitterAsObj3D)
      emitterAsObj3D.parent = renderer
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
        removeObjectFromGroup(entity, emitterAsObj3D)
        nuSystem.dispose()
        emitterAsObj3D.dispose()
        removeBatchedRenderer(sceneID!)
      }
    }, [componentState._loadIndex])

    useEffect(() => {
      const component = componentState.value

      const doLoadEmissionGeo =
        component.systemParameters.shape.type === 'mesh_surface' &&
        AssetLoader.getAssetClass(component.systemParameters.shape.mesh ?? '') === AssetType.Model

      const doLoadInstancingGeo =
        component.systemParameters.instancingGeometry &&
        AssetLoader.getAssetClass(component.systemParameters.instancingGeometry) === AssetType.Model

      const doLoadTexture =
        component.systemParameters.texture &&
        AssetLoader.getAssetClass(component.systemParameters.texture) === AssetType.Image

      const loadedEmissionGeo = (doLoadEmissionGeo && shapeMeshEntity) || !doLoadEmissionGeo
      const loadedInstanceGeo = (doLoadInstancingGeo && geoDependencyEntity) || !doLoadInstancingGeo
      const loadedTexture = (doLoadTexture && texture) || !doLoadTexture

      if (loadedEmissionGeo && loadedInstanceGeo && loadedTexture) {
        componentState._loadIndex.set(componentState._loadIndex.value + 1)
      }
    }, [geoDependencyEntity, shapeMeshEntity, texture, componentState._refresh])

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
