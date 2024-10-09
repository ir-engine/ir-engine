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

import { useEffect, useLayoutEffect } from 'react'

import { defineComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
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

  reactor: () => {
    const entity = useEntityContext()
    const variantComponent = useComponent(entity, VariantComponent)

    useLayoutEffect(() => {
      if (variantComponent.heuristic.value != Heuristic.DEVICE) return

      const targetDevice = isMobile || isMobileXRHeadset ? Devices.MOBILE : Devices.DESKTOP
      //get model src to mobile variant src
      const levelIndex = variantComponent.levels.value.findIndex((level) => level.metadata['device'] === targetDevice)
      if (levelIndex < 0) {
        console.warn('VariantComponent: No asset found for target device')
        return
      }

      variantComponent.currentLevel.set(levelIndex)
    }, [variantComponent.heuristic.value])

    useEffect(() => {
      if (!variantComponent.levels.length) return
      const src = variantComponent.levels[variantComponent.currentLevel.value].src.value
      setComponent(entity, GLTFComponent, { src: src })
    }, [variantComponent.currentLevel.value])

    return null
  }
})
