import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import {
  Entity,
  EntityUUID,
  UUIDComponent,
  defineComponent,
  getComponent,
  getOptionalComponent
} from '@etherealengine/ecs'
import { hookstate, none } from '@etherealengine/hyperflux'
import { getAncestorWithComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { ModelComponent } from '../scene/components/ModelComponent'
import { GLTFComponent } from './GLTFComponent'

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

  getEntityUUIDForNodeEntity: (entity: Entity) => {
    const nodeID = getOptionalComponent(entity, NodeIDComponent)
    if (!nodeID) throw new Error('Entity does not have a NodeIDComponent')
    const nearestSourceEntity =
      getAncestorWithComponent(entity, ModelComponent) || getAncestorWithComponent(entity, GLTFComponent)
    if (nearestSourceEntity) {
      return `${getComponent(nearestSourceEntity, UUIDComponent)}-${nodeID}` as EntityUUID
    }
    return nodeID as any as EntityUUID
  }
})
