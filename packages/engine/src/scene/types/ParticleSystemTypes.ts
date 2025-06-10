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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Entity } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineState } from '@ir-engine/hyperflux'
import {
  AdditiveBlending,
  BufferGeometry,
  CustomBlending,
  Material,
  MultiplyBlending,
  NoBlending,
  NormalBlending,
  SubtractiveBlending,
  Texture,
  Vector2,
  Vector3
} from 'three'
import { BatchedRenderer, Behavior, ParticleSystem, ParticleSystemJSONParameters, RenderMode } from 'three.quarks'

/* START Behavior Types */
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
/* END Behavior Types */

/* START Color Generator Types */
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
/* END Color Generator Types */

/* START Rotation Generator Types */
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
/* END Rotation Generator Types */

/* START Sequencer Types */
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
/* END Sequencer Types */

/* START Shapes Types */
export type PointShapeJSON = {
  type: 'point'
}

export type SphereShapeJSON = {
  type: 'sphere'
  radius?: number
}

export type ConeShapeJSON = {
  type: 'cone'
  radius?: number
  arc?: number
  thickness?: number
  angle?: number
}

export type DonutShapeJSON = {
  type: 'donut'
  radius?: number
  arc?: number
  thickness?: number
  angle?: number
}

export type MeshShapeJSON = {
  type: 'mesh_surface'
  mesh?: string
  geometry: BufferGeometry
}

export type GridShapeJSON = {
  type: 'grid'
  width?: number
  height?: number
  column?: number
  row?: number
}

export type EmitterShapeJSON =
  | PointShapeJSON
  | SphereShapeJSON
  | ConeShapeJSON
  | MeshShapeJSON
  | GridShapeJSON
  | DonutShapeJSON

export const POINT_SHAPE_DEFAULT: PointShapeJSON = {
  type: 'point'
}

export const SPHERE_SHAPE_DEFAULT: SphereShapeJSON = {
  type: 'sphere',
  radius: 1
}

export const CONE_SHAPE_DEFAULT: ConeShapeJSON = {
  type: 'cone',
  radius: 1,
  arc: 0.2,
  thickness: 4,
  angle: 30
}

export const DONUT_SHAPE_DEFAULT: DonutShapeJSON = {
  type: 'donut',
  radius: 1,
  arc: 30,
  thickness: 0.5,
  angle: 15
}

export const MESH_SHAPE_DEFAULT: MeshShapeJSON = {
  type: 'mesh_surface',
  mesh: '',
  geometry: new BufferGeometry()
}

export const GRID_SHAPE_DEFAULT: GridShapeJSON = {
  type: 'grid',
  width: 1,
  height: 1,
  column: 1,
  row: 1
}
/* END Shapes Types */

/* START Value Generator Types */
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
/* END Value Generator Types */

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

export const ParticleState = defineState({
  name: 'ParticleState',
  initial: () => ({
    renderers: {} as Record<Entity, ParticleSystemRendererInstance>
  })
})

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
  renderMode: S.LiteralUnion(Object.values(RenderMode), {
    $comment:
      "A number enum, where: 0 represents 'BillBoard', 1 represents 'StretchedBillBoard', 2 represents 'Mesh', 3 represents 'Trail'",
    default: RenderMode.BillBoard
  }),
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
