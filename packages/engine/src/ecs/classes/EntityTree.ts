import { Entity } from './Entity'

// export enum WalkStrategy {
//   BFS
// }

// Data structure to hold parent child relationship between entities
export default class EntityTree {
  rootNode: EntityTreeNode

  constructor() {
    this.rootNode = new EntityTreeNode(-1 as Entity)
  }

  addEntity(entity: Entity, parentEid?: Entity, index?: number): EntityTreeNode {
    if (parentEid == null) {
      this.rootNode.entity = entity
      return this.rootNode
    }

    let node = this.findNodeFromEid(entity)
    if (node) return node

    node = new EntityTreeNode(entity)
    let parent = this.findNodeFromEid(parentEid)

    if (!parent) {
      parent = new EntityTreeNode(parentEid)
      this.rootNode.addChild(parent)
      parent.parentNode = this.rootNode
    }

    parent.addChild(node, index)
    node.parentNode = parent

    return node
  }

  addEntityNode(
    entityNode: EntityTreeNode,
    parentNode?: EntityTreeNode,
    index?: number,
    skipRootUpdate = false
  ): EntityTreeNode {
    if (parentNode == null) {
      if (!skipRootUpdate) {
        this.rootNode = entityNode
      }

      return this.rootNode
    }

    let node = this.findNodeFromEid(entityNode.entity)
    if (node) {
      if (node.parentNode !== parentNode) node.reparent(parentNode)
      return node
    }

    let parent = this.findNodeFromEid(parentNode.entity)

    if (!parent) {
      this.rootNode.addChild(parentNode)
      parentNode.parentNode = this.rootNode
    }

    parentNode.addChild(entityNode, index)
    entityNode.parentNode = parentNode

    return entityNode
  }

  findNodeFromEid(entity: Entity, node: EntityTreeNode = this.rootNode): EntityTreeNode | undefined {
    if (node.entity === entity) return node

    if (!node.children) return

    for (let i = 0; i < node.children.length; i++) {
      let result = this.findNodeFromEid(entity, node.children[i])

      if (result) return result
    }
  }

  traverse(cb: (node: EntityTreeNode, index: number) => void, node: EntityTreeNode = this.rootNode, index = 0): void {
    cb(node, index)

    if (!node.children) return

    for (let i = 0; i < node.children.length; i++) {
      this.traverse(cb, node.children[i], i)
    }
  }
}

export class EntityTreeNode {
  entity: Entity
  uuid: string
  parentNode: EntityTreeNode
  children?: EntityTreeNode[]

  constructor(entity: Entity) {
    this.entity = entity
  }

  addChild(child: EntityTreeNode, index: number = -1): void {
    if (!this.children) this.children = []

    if (index < 0) {
      this.children.push(child)
      return
    }

    this.children.splice(index, 0, child)
  }

  removeChild(child: EntityTreeNode): EntityTreeNode | undefined {
    if (!this.children) return

    let index = -1

    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].entity === child.entity) {
        index = i
        break
      }
    }

    if (index > -1) return this.children.splice(index, 1)[0]
  }

  removeFromParent() {
    this.parentNode?.removeChild(this)
  }

  reparent(newParent: EntityTreeNode, index?: number) {
    this.removeFromParent()
    newParent.addChild(this, index)
    this.parentNode = newParent
  }

  clone() {
    const node = new EntityTreeNode(this.entity)

    node.parentNode = this.parentNode

    if (this.children) node.children = this.children.map((child) => child.clone())

    return node
  }
}
