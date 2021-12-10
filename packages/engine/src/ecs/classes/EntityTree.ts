import { Entity } from './Entity'

// export enum WalkStrategy {
//   BFS
// }

// Data structure to hold parent child relationship between entities
export default class EntityTree {
  rootNode: EntityTreeNode

  constructor() {
    this.rootNode = new EntityTreeNode(0 as Entity)
  }

  addEntity(entity: Entity, parentEid?: Entity, index?: number) {
    if (parentEid == null) {
      this.rootNode.entity = entity
      return
    }

    let node = this.findNodeFromEid(entity)
    if (node) {
      return
    }

    node = new EntityTreeNode(entity)
    let parent = this.findNodeFromEid(parentEid)

    if (!parent) {
      parent = new EntityTreeNode(parentEid)
      this.rootNode.addChild(parent)
      parent.parentNode = this.rootNode
    }

    parent.addChild(node)
    node.parentNode = parent
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

    const index = this.children.indexOf(child)

    if (index > -1) {
      return this.children.splice(index, 1)[0]
    }
  }

  removeFromParent() {
    this.parentNode?.removeChild(this)
  }

  reparent(newParent: EntityTreeNode, index?: number) {
    this.removeFromParent()
    newParent.addChild(this, index)
    this.parentNode = newParent
  }
}
