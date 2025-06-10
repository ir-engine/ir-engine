import { Entity } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineState } from '@ir-engine/hyperflux'
import {
  AdditiveBlending,
  CustomBlending,
  MultiplyBlending,
  NoBlending,
  NormalBlending,
  SubtractiveBlending
} from 'three'
import { RenderMode } from 'three.quarks'
import {
  BehaviorJSON,
  BezierFunctionJSON,
  ColorGradientFunctionJSON,
  ParticleSystemRendererInstance
} from '../../types/particle-system'

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
