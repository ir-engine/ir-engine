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
