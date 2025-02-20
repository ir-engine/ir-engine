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

import { TTypedSchema } from '@ir-engine/ecs'
import { defineComponent, LayerComponent, LayerID, Layers } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@ir-engine/ecs/src/Entity'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { defineState, getMutableState, getState, none, OpaqueType, useHookstate } from '@ir-engine/hyperflux'
import { NonEmptyString } from '@ir-engine/spatial/src/schema/schemaFunctions'

/**
 * A source ID is expeced to in the format of `<nodeid>-<src>` where src is the source of the model and nodeid is the node id of the entity
 */

export type SourceID = OpaqueType<'SourceID'> & string

export const EntitiesBySourceState = defineState({
  name: 'ir.world.EntitiesBySourceState',
  initial: {} as Record<LayerID, Record<SourceID, Entity[]>>
})

export const SourceIDSchema = () =>
  S.String('', {
    validate: NonEmptyString('SourceComponent expects a non-empty string'),
    id: 'SourceID'
  }) as unknown as TTypedSchema<SourceID>

export const SourceComponent = defineComponent({
  name: 'SourceComponent',

  schema: S.Required(SourceIDSchema()),

  onSet: (entity, component, source: SourceID) => {
    const layer = LayerComponent.get(entity)
    const currentSource = component.value
    if (currentSource) {
      if (currentSource === source) return
      if (currentSource && currentSource !== source) {
        SourceComponent.onRemove(entity, component)
      }
    }
    component.set(source)
    const state = getMutableState(EntitiesBySourceState)
    if (!getState(EntitiesBySourceState)[layer]) state[layer].set({})
    const entitiesBySourceState = state[layer][source]
    if (!entitiesBySourceState.value) {
      entitiesBySourceState.set([entity])
    } else {
      if (!entitiesBySourceState.value.includes(entity)) entitiesBySourceState.merge([entity])
    }
  },

  onRemove: (entity, component) => {
    const layer = LayerComponent.get(entity)
    const entities = getState(EntitiesBySourceState)[layer][component.value].filter(
      (currentEntity) => currentEntity !== entity
    )
    const layerState = getMutableState(EntitiesBySourceState)[layer]
    if (entities.length === 0) {
      layerState[component.value].set(none)
    } else {
      layerState[component.value].set(entities)
    }
  },

  useEntitiesBySource: (sourceID: SourceID, layer = Layers.Simulation as LayerID) => {
    const state = useHookstate(getMutableState(EntitiesBySourceState)[layer]).value
    return state?.[sourceID] || []
  },

  getEntitiesBySource: (sourceID: SourceID, layer = Layers.Simulation as LayerID) => {
    return getState(EntitiesBySourceState)[layer]?.[sourceID] || []
  },

  getSourceID: (uuid: EntityUUID, src: string) => `${uuid}-${src}` as SourceID
})
