/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { ReactElement, useEffect } from 'react'
import matches from 'ts-matches'

import {
  defineComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { DistanceFromCameraComponent } from '@etherealengine/spatial/src/transform/components/DistanceComponents'
import { setInstancedMeshVariant } from '../functions/loaders/VariantFunctions'
import { InstancingComponent } from './InstancingComponent'

export type VariantLevel = {
  src: string
  metadata: Record<string, any>
}

export const VariantComponent = defineComponent({
  name: 'EE_variant',

  jsonID: 'variant',

  onInit: (entity) => ({
    levels: [] as VariantLevel[],
    heuristic: 'MANUAL' as 'DISTANCE' | 'SCENE_SCALE' | 'MANUAL' | 'DEVICE',
    calculated: false
  }),

  onSet: (entity, component, json) => {
    if (!json) return

    if (typeof json.heuristic === 'string') component.heuristic.set(json.heuristic)
    if (
      !!json.levels &&
      matches
        .arrayOf(
          matches.shape({
            src: matches.string,
            metadata: matches.any
          })
        )
        .test(json.levels)
    ) {
      component.levels.set(json.levels)
    }
    if (typeof json.calculated === 'boolean') component.calculated.set(json.calculated)
  },

  toJSON: (entity, component) => ({
    levels: component.levels.value.map((level) => {
      return {
        src: level.src,
        metadata: level.metadata
      }
    }),
    heuristic: component.heuristic.value
  }),

  reactor: VariantReactor
})

function VariantReactor(): ReactElement {
  const entity = useEntityContext()
  const variantComponent = useComponent(entity, VariantComponent)

  const meshComponent = getOptionalComponent(entity, MeshComponent)

  useEffect(() => {
    if (variantComponent.heuristic.value === 'DISTANCE' && meshComponent) {
      meshComponent.removeFromParent()
    }
  }, [meshComponent])

  return (
    <>
      {variantComponent.levels.map((level, index) => (
        <VariantLevelReactor entity={entity} level={index} key={`${entity}-${index}`} />
      ))}
    </>
  )
}

const VariantLevelReactor = React.memo(({ entity, level }: { level: number; entity: Entity }) => {
  const variantComponent = useComponent(entity, VariantComponent)
  const variantLevel = variantComponent.levels[level]

  useEffect(() => {
    //if the variant heuristic is set to Distance, add the DistanceFromCameraComponent
    if (variantComponent.heuristic.value === 'DISTANCE') {
      setComponent(entity, DistanceFromCameraComponent)
      variantLevel.metadata['minDistance'].value === undefined && variantLevel.metadata['minDistance'].set(0)
      variantLevel.metadata['maxDistance'].value === undefined && variantLevel.metadata['maxDistance'].set(0)
    } else {
      //otherwise, remove the DistanceFromCameraComponent
      hasComponent(entity, DistanceFromCameraComponent) && removeComponent(entity, DistanceFromCameraComponent)
    }
  }, [variantComponent.heuristic])

  const meshComponent = useOptionalComponent(entity, MeshComponent)
  const instancingComponent = getOptionalComponent(entity, InstancingComponent)

  useEffect(() => {
    meshComponent && instancingComponent && setInstancedMeshVariant(entity)
  }, [variantLevel.src, variantLevel.metadata, meshComponent])

  return null
})
