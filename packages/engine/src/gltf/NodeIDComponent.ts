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

import {
  createEntity,
  defineComponent,
  Entity,
  EntityUUID,
  getComponent,
  LayerID,
  Layers,
  S,
  setComponent,
  TTypedSchema,
  useEntityContext,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { defineState, getMutableState, getState, none, OpaqueType } from '@ir-engine/hyperflux'
import { NonEmptyString } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { SourceComponent, SourceID } from '../scene/components/SourceComponent'

export type NodeID = OpaqueType<'NodeID'> & string

export const NodeIDSchema = () => S.String('', { id: 'NodeID' }) as unknown as TTypedSchema<NodeID>

export const NodesBySourceState = defineState({
  name: 'ir.world.NodesBySourceState',
  initial: {} as Record<SourceID, Record<NodeID, Entity>>
})

export const NodeIDComponent = defineComponent({
  name: 'NodeIDComponent',
  jsonID: 'EE_uuid',

  schema: S.Required(
    S.String('', {
      /** @todo we should also validate to see if it currently is defined, and if not then disallow changing */
      validate: NonEmptyString('NodeIDComponent expects a non-empty string'),
      id: 'NodeID'
    }) as unknown as TTypedSchema<NodeID>
  ),

  reactor: () => {
    const entity = useEntityContext()
    const sourceID = useOptionalComponent(entity, SourceComponent)?.value

    useEffect(() => {
      if (!sourceID) return

      const nodeID = getComponent(entity, NodeIDComponent)
      const state = getMutableState(NodesBySourceState)

      if (!state.value[sourceID]) state[sourceID].set({})

      if (!state[sourceID].value[nodeID]) state[sourceID][nodeID].set(entity)

      return () => {
        if (!getState(NodesBySourceState)?.[sourceID]?.[nodeID]) return

        state[sourceID][nodeID].set(none)

        if (!state[sourceID].keys.length) state[sourceID].set(none)
      }
    }, [sourceID])

    return null
  },

  getUUIDBySourceAndNodeID: (source: SourceID, nodeID: NodeID) => `${source}-${nodeID}` as EntityUUID,

  /**
   * Creates a new entity with the NodeIDComponent and SourceComponent.
   * - Also sets the UUIDComponent to the NodeIDComponent's UUID.
   */
  create: (sourceID: SourceID, nodeID: NodeID, layer = Layers.Simulation as LayerID) => {
    const entity = createEntity(layer)
    setComponent(entity, NodeIDComponent, nodeID)
    setComponent(entity, SourceComponent, sourceID)
    setComponent(entity, UUIDComponent, NodeIDComponent.getUUIDBySourceAndNodeID(sourceID, nodeID))
    return entity
  },

  generate: () => uuidv4() as NodeID
})
