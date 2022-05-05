import { Entity } from './Entity'

// Data structure to hold parent child relationship between entities
export default interface EntityTree {
  rootNode: EntityTreeNode
  entityNodeMap: Map<Entity, EntityTreeNode>
  uuidNodeMap: Map<string, EntityTreeNode>
}

export type EntityTreeNode = {
  type: 'EntityNode'
  entity: Entity
  uuid: string
  parentEntity?: Entity
  children?: Entity[]
}
