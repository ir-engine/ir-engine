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

import React, { ReactElement, useEffect } from 'react'

import {
  ComponentType,
  defineComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { DistanceFromCameraComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'

import { S } from '@ir-engine/ecs/src/ComponentSchemaUtils'
import { NO_PROXY, useImmediateEffect } from '@ir-engine/hyperflux'
import { setInstancedMeshVariant, updateModelVariant } from '../functions/loaders/VariantFunctions'
import { InstancingComponent } from './InstancingComponent'
import { ModelComponent } from './ModelComponent'

export type VariantLevel = {
  src: string
  metadata: Record<string, any>
}

export enum Heuristic {
  DISTANCE = 'DISTANCE',
  SCENE_SCALE = 'SCENE_SCALE',
  MANUAL = 'MANUAL',
  DEVICE = 'DEVICE',
  BUDGET = 'BUDGET'
}

export const distanceBased = (variantComponent: ComponentType<typeof VariantComponent>): boolean => {
  return (
    variantComponent.heuristic === Heuristic.DISTANCE ||
    (variantComponent.heuristic === Heuristic.BUDGET && variantComponent.useDistance)
  )
}

export const VariantComponent = defineComponent({
  name: 'EE_variant',
  jsonID: 'EE_variant',

  schema: S.Object({
    levels: S.Array(S.Object({ src: S.String(), metadata: S.Record(S.String(), S.Any()) })),
    heuristic: S.Enum(Heuristic, Heuristic.MANUAL),
    useDistance: S.Bool(false),
    currentLevel: S.Number(0),
    budgetLevel: S.Number(0)
  }),

  reactor: VariantReactor
})

function VariantReactor(): ReactElement {
  const entity = useEntityContext()
  const variantComponent = useComponent(entity, VariantComponent)
  const modelComponent = useOptionalComponent(entity, ModelComponent)
  const meshComponent = getOptionalComponent(entity, MeshComponent)

  useImmediateEffect(() => {
    if (variantComponent.heuristic.value !== Heuristic.BUDGET) return

    const sortedLevels = (variantComponent.levels.get(NO_PROXY) as VariantLevel[]).sort((left, right) => {
      const leftVertexCount = left.metadata['vertexCount'] ? (left.metadata['vertexCount'] as number) : 0
      const rightVertexCount = right.metadata['vertexCount'] ? (right.metadata['vertexCount'] as number) : 0
      return rightVertexCount - leftVertexCount
    })

    variantComponent.levels.set(sortedLevels)
  }, [variantComponent.heuristic])

  useEffect(() => {
    const currentLevel = variantComponent.currentLevel.value
    let src: string | undefined = undefined
    if (variantComponent.heuristic.value === Heuristic.BUDGET) {
      const budgetLevel = variantComponent.budgetLevel.value
      if (currentLevel >= budgetLevel) {
        src = variantComponent.levels[currentLevel].src.value
      } else {
        src = variantComponent.levels[budgetLevel].src.value
      }
    } else {
      src = variantComponent.levels[currentLevel].src && variantComponent.levels[currentLevel].src.value
    }

    if (src && modelComponent && modelComponent.src.value !== src) modelComponent.src.set(src)
  }, [variantComponent.currentLevel])

  useEffect(() => {
    if (variantComponent.heuristic.value === Heuristic.BUDGET)
      updateModelVariant(entity, variantComponent, modelComponent!)
  }, [variantComponent.budgetLevel])

  useEffect(() => {
    if (distanceBased(variantComponent.value as ComponentType<typeof VariantComponent>) && meshComponent) {
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
    if (distanceBased(variantComponent.value as ComponentType<typeof VariantComponent>)) {
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
