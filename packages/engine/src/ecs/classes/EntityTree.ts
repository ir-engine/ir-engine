import { Entity } from "./Entity"

// export enum WalkStrategy {
//   BFS
// }


// Data structure to hold parent child relationship between entities
export default class EntityTree {
  rootNode: TreeNode


  constructor() {
    this.rootNode = new TreeNode(0 as Entity)
  }

  addEntity(eid: Entity, parentEid?: Entity, index?: number) {
    if (parentEid == null) {
      this.rootNode.eid = eid
      return
    }

    let node = this.findNodeFromEid(eid)
    if (node) {
      return
    }

    node = new TreeNode(eid)
    let parent = this.findNodeFromEid(parentEid)

    if (!parent) {
      parent = new TreeNode(parentEid)
      this.rootNode.addChild(parent)
      parent.parentNode = this.rootNode
    }

    parent.addChild(node)
    node.parentNode = parent
  }

  findNodeFromEid(eid: Entity, node: TreeNode = this.rootNode): TreeNode | undefined {
    if (node.eid === eid) return node

    if (!node.children) return

    for (let i = 0; i < node.children.length; i++) {
      let result = this.findNodeFromEid(eid, node.children[i])

      if (result) return result
    }
  }
}

export class TreeNode {
  eid: Entity
  parentNode: TreeNode
  children?: TreeNode[]
  [key: string]: any

  constructor(eid: Entity) {
    this.eid = eid
  }

  addChild(child: TreeNode, index: number = -1): void {
    if (!this.children) this.children = []

    if (index < 0) {
      this.children.push(child)
      return
    }

    this.children.splice(index, 0, child)
  }

  removeChild(child: TreeNode): TreeNode | undefined {
    if (!this.children) return

    const index = this.children.indexOf(child)

    if (index > -1) {
      return this.children.splice(index, 1)[0]
    }
  }

  removeFromParent() {
    this.parentNode?.removeChild(this)
  }

  reparent(newParent: TreeNode, index?: number) {
    this.removeFromParent()
    newParent.addChild(this, index)
    this.parentNode = newParent
  }
}