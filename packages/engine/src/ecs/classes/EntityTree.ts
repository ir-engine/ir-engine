import { MathUtils } from 'three'
import { Entity } from './Entity'

// Data structure to hold parent child relationship between entities
export default class EntityTree {
  rootNode: EntityTreeNode

  constructor() {
    this.rootNode = new EntityTreeNode(-1 as Entity)
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
        this.rootNode.uuid = entityNode.uuid
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

  findNodeFromUUID(uuid: string, node: EntityTreeNode = this.rootNode): EntityTreeNode | undefined {
    if (node.uuid === uuid) return node

    if (!node.children) return

    for (let i = 0; i < node.children.length; i++) {
      let result = this.findNodeFromUUID(uuid, node.children[i])

      if (result) return result
    }
  }

  traverse(cb: (node: EntityTreeNode, index: number) => void, index = 0): void {
    this.rootNode.traverse(cb, index)
  }

  empty(): void {
    const arr = [] as EntityTreeNode[]
    this.traverse((node) => arr.push(node))

    for (let i = arr.length - 1; i >= 0; i--) {
      delete arr[i]
    }

    this.rootNode = new EntityTreeNode(-1 as Entity)
  }
}

export class EntityTreeNode {
  entity: Entity
  uuid: string
  parentNode: EntityTreeNode
  children?: EntityTreeNode[]

  constructor(entity: Entity, uuid?: string) {
    this.entity = entity
    this.uuid = uuid || MathUtils.generateUUID()
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

  traverse(cb: (node: EntityTreeNode, index: number) => void, index = 0): void {
    cb(this, index)

    if (!this.children) return

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].traverse(cb, i)
    }
  }

  traverseParent(cb: (parent: EntityTreeNode) => void): void {
    if (this.parentNode) {
      cb(this.parentNode)
      this.parentNode.traverseParent(cb)
    }
  }
}
