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

import { Entity, Static } from '@ir-engine/ecs'
import { defineComponent, getComponent, getMutableComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { DistanceFromCameraComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'

export type VariantLevel = {
  src: string
  metadata: Record<string, any>
}

export const Heuristic = {
  DISTANCE: 'DISTANCE' as const,
  MANUAL: 'MANUAL' as const,
  DEVICE: 'DEVICE' as const
}

export type Heuristic = (typeof Heuristic)[keyof typeof Heuristic]

export const Devices = {
  DESKTOP: 'DESKTOP' as const,
  MOBILE: 'MOBILE' as const,
  XR: 'XR' as const
}

export const distanceMetadataSchema = S.Object({
  minDistance: S.Union([S.Number(), S.Undefined()], { default: undefined }),
  maxDistance: S.Union([S.Number(), S.Undefined()], { default: undefined })
})

export const deviceMetadataSchema = S.Object({
  device: S.Enum(Devices, {
    $comment: "A string enum, ie. one of the following values: 'DESKTOP', 'MOBILE', 'XR'",
    default: Devices.DESKTOP
  })
})

export type VariantMetadata = Static<typeof distanceMetadataSchema> | Static<typeof deviceMetadataSchema>

export const VariantComponent = defineComponent({
  name: 'VariantComponent',
  jsonID: 'EE_variant',

  schema: S.Object({
    levels: S.Array(
      S.Object({
        src: S.String(),
        metadata: S.Union([distanceMetadataSchema, deviceMetadataSchema])
      })
    ),
    heuristic: S.Enum(Heuristic, {
      $comment: "A string enum, ie. one of the following values: 'DISTANCE', 'MANUAL', 'DEVICE'",
      default: Heuristic.MANUAL
    }),
    currentLevel: S.Number({ default: 0, serialized: false })
  }),

  setDistanceLevel: (entity: Entity) => {
    const variantComponent = getComponent(entity, VariantComponent)
    if (variantComponent.heuristic !== Heuristic.DISTANCE) return
    const distance = DistanceFromCameraComponent.squaredDistance[entity]
    for (let i = 0; i < variantComponent.levels.length; i++) {
      const level = variantComponent.levels[i]
      if ([level.metadata['minDistance'], level.metadata['maxDistance']].includes(undefined)) continue
      const minDistance = Math.pow(level.metadata['minDistance'], 2)
      const maxDistance = Math.pow(level.metadata['maxDistance'], 2)
      if (minDistance <= distance && distance <= maxDistance) {
        getMutableComponent(entity, VariantComponent).currentLevel.set(i)
        break
      }
    }
  }
})
