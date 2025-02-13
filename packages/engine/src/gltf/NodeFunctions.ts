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
