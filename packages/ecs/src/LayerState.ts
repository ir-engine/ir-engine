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

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'
import { defineState, getMutableState, getState, NO_PROXY, useMutableState } from '@ir-engine/hyperflux'
import { Entity } from './Entity'

export type LayerID = OpaqueType<'LayerID'> & string

export type LayerRelationType = 'inherit' //inherit: target layer receives same updates as source layer when they happen, but can still deviate values later

export type Layer = {
  enabled: boolean
  relations: Record<LayerID, LayerRelationType>
}

export const EntityLayerState = defineState({
  name: 'EntityLayerState',
  initial: {
    layers: {
      simulation: {
        enabled: true,
        relations: {}
      }
    } as Record<LayerID, Layer>,
    entityLayerMap: {} as Record<Entity, LayerID>,
    linkedEntities: {} as Record<Entity, Record<LayerID, Entity>>
  },
  getEntityLayer: (entity: Entity) => {
    const layerState = getState(EntityLayerState)
    const layerID = layerState.entityLayerMap[entity]
    return layerState.layers[layerID]
  },
  useEntityLayer: (entity: Entity) => {
    const layerState = useMutableState(EntityLayerState)
    const layerID = layerState.entityLayerMap[entity]
    return layerState.layers[layerID.value]
  },
  getLinkedEntity: (entity: Entity, layerID: LayerID) => {
    const layerState = getState(EntityLayerState)
    const linkedEntities = layerState.linkedEntities[entity]
    return linkedEntities[layerID]
  },
  useLinkedEntity: (entity: Entity, layerID: LayerID) => {
    const layerState = useMutableState(EntityLayerState)
    const linkedEntities = layerState.linkedEntities[entity]
    return linkedEntities[layerID]
  },
  linkEntity: (srcEntity: Entity, dstEntity: Entity) => {
    const layerState = getMutableState(EntityLayerState)
    const srcLayerID = layerState.entityLayerMap[srcEntity].value
    const dstLayerID = layerState.entityLayerMap[dstEntity].value
    if (srcLayerID === dstLayerID) return
    const srcLinkedEntities = layerState.linkedEntities[srcEntity]
    srcLinkedEntities[dstLayerID].set(dstEntity)
    layerState.linkedEntities[dstEntity].set(srcLinkedEntities.get(NO_PROXY))
  }
})
