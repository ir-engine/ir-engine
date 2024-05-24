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

import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import {
  Entity,
  defineComponent,
  getComponent,
  getOptionalComponent,
  useOptionalComponent,
  useQuery
} from '@etherealengine/ecs'
import { hookstate, none } from '@etherealengine/hyperflux'
import { SourceComponent } from './SourceComponent'

export type NodeID = OpaqueType<'NodeID'> & string

const entitiesByNodeID = {} as Record<NodeID, Entity[]>

export const NodeIDComponent = defineComponent({
  name: 'NodeIDComponent',
  jsonID: 'EE_uuid',

  onInit: () => '' as NodeID,

  onSet: (entity, component, nodeID?: NodeID) => {
    if (typeof nodeID !== 'string') throw new Error('NodeIDComponent expects a non-empty string')
    // remove the entity from the previous nodeID state
    if (component.value && entitiesByNodeID[component.value]) {
      const index = entitiesByNodeID[component.value].indexOf(entity)
      NodeIDComponent.entitiesByNodeIDState[component.value][index].set(none)
      if (!entitiesByNodeID[component.value].length) NodeIDComponent.entitiesByNodeIDState[component.value].set(none)
    }
    // set the new nodeID
    component.set(nodeID)
    // add the entity to the new nodeID state
    const exists = NodeIDComponent.entitiesByNodeID[nodeID]
    const entitiesByNodeIDState = NodeIDComponent.entitiesByNodeIDState
    if (exists) {
      if (!exists.includes(entity)) entitiesByNodeIDState.merge({ [nodeID]: [...exists, entity] })
    } else entitiesByNodeIDState.merge({ [nodeID]: [entity] })
  },

  onRemove: (entity, component) => {
    const nodeID = component.value
    const nodeEntities = NodeIDComponent.entitiesByNodeIDState[nodeID]
    const isSingleton = nodeEntities.length === 1
    isSingleton && nodeEntities.set(none)
    !isSingleton && nodeEntities.set(nodeEntities.value.filter((e) => e !== entity))
  },

  entitiesByNodeIDState: hookstate(entitiesByNodeID),
  entitiesByNodeID: entitiesByNodeID as Readonly<typeof entitiesByNodeID>,

  getEntitiesByNodeID: (nodeID: NodeID): Entity[] | undefined => {
    return NodeIDComponent.entitiesByNodeID[nodeID]
  },

  getNodeEntityFromSameSource: (sourceEntity: Entity, nodeID: NodeID) => {
    const sourceID = getComponent(sourceEntity, SourceComponent)
    return SourceComponent.entitiesBySource[sourceID].findLast(
      (entity) => getComponent(entity, NodeIDComponent) === nodeID
    )
  },

  useNodeEntityFromSameSource: (sourceEntity: Entity, nodeID: NodeID) => {
    const sourceID = useOptionalComponent(sourceEntity, SourceComponent)
    useQuery([NodeIDComponent]) // reactivity
    if (!sourceID) return
    return SourceComponent.entitiesBySourceState[sourceID.value].value.findLast(
      (entity) => getOptionalComponent(entity, NodeIDComponent) === nodeID
    )
  }
})
