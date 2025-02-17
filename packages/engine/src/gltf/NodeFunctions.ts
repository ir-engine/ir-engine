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

import { Entity, getOptionalComponent, UndefinedEntity, useOptionalComponent } from '@ir-engine/ecs'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { SourceComponent } from '../scene/components/SourceComponent'
import { GLTFComponent } from './GLTFComponent'
import { NodeID, NodesBySourceState } from './NodeIDComponent'

export const NodeFunctions = {
  /**
   * For most cases, we can assume that the instance of a node we are looking for is from the same asset and in the same source instance as the node we are looking for.
   */
  getEntityFromNodeID: (sameSourceEntity: Entity, nodeID: NodeID) => {
    const sourceID =
      getOptionalComponent(sameSourceEntity, SourceComponent) || GLTFComponent.getInstanceID(sameSourceEntity)
    if (!sourceID) return UndefinedEntity

    return getState(NodesBySourceState)?.[sourceID]?.[nodeID] || UndefinedEntity
  },

  /**
   * For most cases, we can assume that the instance of a node we are looking for is from the same asset and in the same source instance as the node we are looking for.
   */
  useEntityFromNodeID: (sameSourceEntity: Entity, nodeID: NodeID) => {
    const state = useHookstate(getMutableState(NodesBySourceState))
    const sourceID = useOptionalComponent(sameSourceEntity, SourceComponent)?.value
    const sourceInstanceID = GLTFComponent.useInstanceID(sameSourceEntity)

    if (!sourceID || !sourceInstanceID) return UndefinedEntity

    return state[sourceID ?? sourceInstanceID]?.[nodeID]?.value || UndefinedEntity
  }
}
