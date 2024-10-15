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
  defineComponent,
  getComponent,
  getMutableComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'

import { Entity } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { DistanceFromCameraComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import { GLTFComponent } from '../../gltf/GLTFComponent'

export type VariantLevel = {
  src: string
  metadata: Record<string, any>
}

export enum Heuristic {
  DISTANCE = 'DISTANCE',
  MANUAL = 'MANUAL',
  DEVICE = 'DEVICE'
}

export enum Devices {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  XR = 'XR'
}

export const VariantComponent = defineComponent({
  name: 'EE_variant',
  jsonID: 'EE_variant',

  schema: S.Object({
    levels: S.Array(S.Object({ src: S.String(), metadata: S.Record(S.String(), S.Any()) })),
    heuristic: S.Enum(Heuristic, Heuristic.MANUAL),
    currentLevel: S.NonSerialized(S.Number(0))
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
  },

  reactor: () => {
    const entity = useEntityContext()
    const variantComponent = useComponent(entity, VariantComponent)

    useEffect(() => {
      const heuristic = variantComponent.heuristic.value
      if (heuristic === Heuristic.DEVICE) {
        const targetDevice = isMobile || isMobileXRHeadset ? Devices.MOBILE : Devices.DESKTOP
        const levelIndex = variantComponent.levels.value.findIndex((level) => level.metadata['device'] === targetDevice)
        if (levelIndex < 0) {
          console.warn('VariantComponent: No asset found for target device')
          return
        }
        variantComponent.currentLevel.set(levelIndex)
      } else if (heuristic === Heuristic.DISTANCE) {
        setComponent(entity, DistanceFromCameraComponent)
        VariantComponent.setDistanceLevel(entity)
        return () => {
          removeComponent(entity, DistanceFromCameraComponent)
        }
      }
    }, [variantComponent.heuristic])

    useEffect(() => {
      if (!variantComponent.levels.length) return

      const currentLevel = variantComponent.currentLevel.value
      const src = variantComponent.levels[currentLevel].src.value
      if (!src) return

      setComponent(entity, GLTFComponent, { src: src })
    }, [variantComponent.currentLevel])

    return null
  }
})
