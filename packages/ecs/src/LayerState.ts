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
