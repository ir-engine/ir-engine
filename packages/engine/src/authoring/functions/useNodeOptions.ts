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

import {
  Entity,
  EntityID,
  EntityUUID,
  getAuthoringCounterpart,
  getComponent,
  getOptionalComponent,
  hasComponent,
  Layers,
  useQuery,
  UUIDComponent
} from '@ir-engine/ecs'
import { useHookstate } from '@ir-engine/hyperflux'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import * as bitECS from 'bitecs'
import { useEffect } from 'react'

export type CallbackOptionType = {
  callbacks: Array<{
    label: string
    value: EntityID | 'Self'
  }>
  label: string
  value: EntityID | 'Self'
}

export type NodeOptionsType = {
  label: string
  value: EntityID | 'Self'
}

/**
 * Returns an options list of entities in the same source that have a CallbackComponent
 *
 * @param entity An entity in the same source
 * @returns
 */
export const useCallbackQueryOptions = (entity: Entity) => {
  const sourceEntity = UUIDComponent.getSourceEntity(entity)
  const source = UUIDComponent.getAsSourceID(sourceEntity)
  const query = UUIDComponent.getEntitiesBySource(source).filter(
    (e) => !!getAuthoringCounterpart(e) && hasComponent(e, CallbackComponent)
  )
  return query
    .map((e) => {
      const options = [] as CallbackOptionType[]
      const entityCallbacks = getOptionalComponent(e, CallbackComponent)
      if (entityCallbacks) {
        options.push({
          label: e === entity ? 'Self' : getComponent(e, NameComponent),
          value: e === entity ? 'Self' : getComponent(e, UUIDComponent).entityID,
          callbacks: Object.keys(entityCallbacks).map((cb) => {
            return { label: cb, value: cb as EntityID }
          })
        })
      } else if (e === entity) {
        options.push({
          label: 'Self',
          value: 'Self',
          callbacks: []
        })
      }
      return options
    })
    .flat()
}

/**
 * Returns an options list of entities in the same source
 *
 * @param entity An entity in the same source
 * @returns
 */
export const useNodeOptions = (entity: Entity) => {
  const sourceEntity = UUIDComponent.getSourceEntity(entity)
  const source = UUIDComponent.getAsSourceID(sourceEntity)
  const query = UUIDComponent.getEntitiesBySource(source)
  return query.map((entity) => {
    return {
      label: entity === entity ? 'Self' : getComponent(entity, NameComponent),
      value: entity === entity ? '' : getComponent(entity, UUIDComponent).entityID
    }
  })
}

export type EntityOptionType = { label: string; value: EntityUUID; entity: Entity }

/**
 * Returns a list of authoring layer EntitiyOptionTypes that match the component array filter
 * @param filter
 */
export const useEntityOptions = (filter: bitECS.QueryTerm[]) => {
  const entityOptions = useHookstate<EntityOptionType[]>([])

  // Query all entities
  const filteredEntities = useQuery(filter, Layers.Authoring)

  // Update entity options when entities change
  useEffect(() => {
    // Create options for the Select components
    const options = filteredEntities.map((entity) => {
      const name = hasComponent(entity, NameComponent) ? getComponent(entity, NameComponent) : `Entity ${entity}`

      const entityUUID = hasComponent(entity, UUIDComponent) ? UUIDComponent.get(entity) : (`${entity}` as EntityUUID)

      return {
        label: name,
        value: entityUUID,
        entity
      }
    })

    entityOptions.set(options)
  }, [filteredEntities.length, filter])

  return entityOptions
}
