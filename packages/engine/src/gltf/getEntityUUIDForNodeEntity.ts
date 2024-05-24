import { Entity, EntityUUID, UUIDComponent, getComponent, getOptionalComponent } from '@etherealengine/ecs'
import { getAncestorWithComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { NodeIDComponent } from '@etherealengine/spatial/src/transform/components/NodeIDComponent'
import { ModelComponent } from '../scene/components/ModelComponent'
import { GLTFComponent } from './GLTFComponent'

export const getEntityUUIDForNodeEntity = (entity: Entity) => {
  const nodeID = getOptionalComponent(entity, NodeIDComponent)
  if (!nodeID) throw new Error('Entity does not have a NodeIDComponent')
  const nearestSourceEntity =
    getAncestorWithComponent(entity, ModelComponent) || getAncestorWithComponent(entity, GLTFComponent)
  if (nearestSourceEntity) {
    return `${getComponent(nearestSourceEntity, UUIDComponent)}-${nodeID}` as EntityUUID
  }
  return nodeID as any as EntityUUID
}
