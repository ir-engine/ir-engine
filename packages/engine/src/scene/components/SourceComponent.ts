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

import { iterateEntityNode } from '@ir-engine/ecs'
import { defineComponent, getOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { hookstate, none, useHookstate } from '@ir-engine/hyperflux'
import { NonEmptyString } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { GLTFComponent } from '../../gltf/GLTFComponent'

const entitiesBySource = {} as Record<string, Entity[]>

export const SourceComponent = defineComponent({
  name: 'SourceComponent',

  schema: S.Required(
    S.String('', {
      validate: NonEmptyString('SourceComponent expects a non-empty string')
    })
  ),

  onSet: (entity, component, source: string) => {
    const currentSource = component.value
    if (currentSource) {
      if (currentSource === source) return
      if (currentSource && currentSource !== source) {
        SourceComponent.onRemove(entity, component)
      }
    }
    component.set(source)
    const entitiesBySourceState = SourceComponent.entitiesBySourceState[source]
    if (!entitiesBySourceState.value) {
      entitiesBySourceState.set([entity])
    } else {
      if (!entitiesBySourceState.value.includes(entity)) entitiesBySourceState.merge([entity])
    }
  },

  onRemove: (entity, component) => {
    const entities = SourceComponent.entitiesBySource[component.value].filter(
      (currentEntity) => currentEntity !== entity
    )
    if (entities.length === 0) {
      SourceComponent.entitiesBySourceState[component.value].set(none)
    } else {
      SourceComponent.entitiesBySourceState[component.value].set(entities)
    }
  },

  useEntitiesBySource: (rootEntity: Entity) => {
    const source = GLTFComponent.useInstanceID(rootEntity)
    return useHookstate(SourceComponent.entitiesBySourceState[source]).value as Entity[]
  },

  getEntitiesBySource: (rootEntity: Entity) => {
    const source = GLTFComponent.getInstanceID(rootEntity)
    const entities = [] as Entity[]
    iterateEntityNode(rootEntity, (childEntity) => {
      if (rootEntity === childEntity) return
      const src = getOptionalComponent(childEntity, SourceComponent)
      if (src !== source) return
      entities.push(childEntity)
    })
    return entities
  },

  entitiesBySourceState: hookstate(entitiesBySource),
  entitiesBySource: entitiesBySource as Readonly<typeof entitiesBySource>
})
