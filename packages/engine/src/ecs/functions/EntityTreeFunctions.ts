import { MathUtils } from 'three'

import { Entity } from '../classes/Entity'
import EntityTree, { EntityTreeNode } from '../classes/EntityTree'
import { useWorld } from './SystemHooks'

// ========== Entity Tree Functions ========== //
/**
 * Adds passed node to all the tree maps
 * @param node Node to be added to the maps
 * @param tree Entity Tree
 */
export function addToEntityTreeMaps(node: EntityTreeNode, tree = useWorld().entityTree) {
  tree.entityNodeMap.set(node.entity, node)
  tree.uuidNodeMap.set(node.uuid, node)
}

/**
 * Removes passed node from all the tree maps
 * @param node Node to be removed from the maps
 * @param tree Entity tree
 */
export function removeFromEntityTreeMaps(node: EntityTreeNode, tree = useWorld().entityTree) {
  tree.entityNodeMap.delete(node.entity)
  tree.uuidNodeMap.delete(node.uuid)
}

/**
 * Initialize the world with enity tree
 * @param world World
 */
export function initializeEntityTree(world = useWorld()): void {
  world.entityTree = {
    rootNode: createEntityNode(-1 as Entity),
    entityNodeMap: new Map(),
    uuidNodeMap: new Map()
  } as EntityTree
}

/**
 * Adds Entity to Entity tree
 * @param entityNode Entity node to be added into the tree
 * @param parentNode Parent node of the entity
 * @param index Index at which entiy node will be added in parent node
 * @param skipRootUpdate Whether the root of the tree should be updated or not
 * @param tree Entity Tree
 * @returns Newly created Entity Tree node
 */
export function addEntityNodeInTree(
  entityNode: EntityTreeNode,
  parentNode?: EntityTreeNode,
  index?: number,
  skipRootUpdate = false,
  tree = useWorld().entityTree
): EntityTreeNode {
  if (parentNode == null) {
    if (!skipRootUpdate) {
      tree.rootNode = entityNode
      addToEntityTreeMaps(entityNode, tree)
    }

    return tree.rootNode
  }

  const node = tree.entityNodeMap.get(entityNode.entity)

  if (node) {
    if (node.parentEntity !== parentNode.entity) reparentEntityNode(node, parentNode)
    return node
  }

  const parent = tree.entityNodeMap.get(parentNode.entity)

  if (!parent) {
    addEntityNodeChild(tree.rootNode, parentNode)
  }

  addEntityNodeChild(parentNode, entityNode, index)

  return entityNode
}

/**
 * Empties the the tree and removes its element from memory
 * @param tree Entity tree
 */
export function emptyEntityTree(tree = useWorld().entityTree): void {
  const arr = [] as EntityTreeNode[]
  tree.entityNodeMap.forEach((node) => arr.push(node))

  for (let i = arr.length - 1; i >= 0; i--) {
    delete arr[i]
  }

  tree.rootNode = createEntityNode(-1 as Entity)
}
// ========== Entity Tree Functions ========== //

// ========== Entity Tree Node Functions ========== //
/**
 * Creates new Entity node with some default values
 * @param entity Entity of the newly created node
 * @param uuid UUID of newly created node. If not provided new one will be generated
 * @returns Newly created Entity node
 */
export function createEntityNode(entity: Entity, uuid?: string): EntityTreeNode {
  return {
    type: 'EntityNode',
    entity,
    uuid: uuid || MathUtils.generateUUID()
  }
}

/**
 * Adds entity node as a child of passed node
 * @param node Node in which child node will be added
 * @param child Child node to be added
 * @param index Index at which child node will be added
 */
export function addEntityNodeChild(node: EntityTreeNode, child: EntityTreeNode, index: number = -1): void {
  if (!node.children) node.children = []

  if (index < 0) {
    node.children.push(child.entity)
  } else {
    node.children.splice(index, 0, child.entity)
  }

  child.parentEntity = node.entity
  addToEntityTreeMaps(child)
}

/**
 * Removes passed child node from passed entity node
 * @param node Entity node whose child will be removed
 * @param child Child node to be removed
 * @param tree Entity Tree
 * @returns Removed node
 */
export function removeEntityNodeChild(
  node: EntityTreeNode,
  child: EntityTreeNode,
  tree = useWorld().entityTree
): EntityTreeNode | undefined {
  if (!node.children) return

  let index = -1

  for (let i = 0; i < node.children.length; i++) {
    if (node.children[i] === child.entity) {
      index = i
      break
    }
  }

  if (index > -1) {
    removeFromEntityTreeMaps(child, tree)
    return tree.entityNodeMap.get(node.children.splice(index, 1)[0])
  }
}

/**
 * Removes Entity node from its parent
 * @param node Node to be removed from parent
 * @param tree Entity tree
 * @returns Removed node
 */
export function removeEntityNodeFromParent(
  node: EntityTreeNode,
  tree = useWorld().entityTree
): EntityTreeNode | undefined {
  if (node.parentEntity) {
    const parent = tree.entityNodeMap.get(node.parentEntity)
    if (parent) return removeEntityNodeChild(parent, node, tree)
  }
}

/**
 * Reparent passed entity tree node to new parent node
 * @param node Node to be reparented
 * @param newParent Parent node
 * @param index Index at which passed node will be set as child in parent node's children arrays
 */
export function reparentEntityNode(node: EntityTreeNode, newParent: EntityTreeNode, index?: number): void {
  removeEntityNodeFromParent(node)
  addEntityNodeChild(newParent, node, index)
}

/**
 * Clones passed node
 * @param node Node to be cloned
 * @returns Cloned Entity tree node
 */
export function cloneEntityNode(node: EntityTreeNode): EntityTreeNode {
  return Object.assign({}, node)
}

/**
 * Traverse child nodes of the given node. Traversal will start from the passed node
 * @param node Node to be traverse
 * @param cb Callback function which will be called for every traverse
 * @param index index of the curren node in it's parent
 * @param tree Entity Tree
 */
export function traverseEntityNode(
  node: EntityTreeNode,
  cb: (node: EntityTreeNode, index: number) => void,
  index = 0,
  tree = useWorld().entityTree
): void {
  cb(node, index)

  if (!node.children) return

  for (let i = 0; i < node.children.length; i++) {
    const child = tree.entityNodeMap.get(node.children[i])
    if (child) traverseEntityNode(child, cb, i, tree)
  }
}

/**
 * Iteratively traverse parent nodes for given Entity Tree Node
 * @param node Node for which traversal will occur
 * @param cb Callback function which will be called for every traverse
 * @param pred Predicate function which will not process a node or its children if return false
 * @param tree Entity Tree
 */
export function iterateEntityNode(
  node: EntityTreeNode,
  cb: (node: EntityTreeNode, index: number) => void,
  pred: (node: EntityTreeNode) => boolean = (x) => true,
  tree = useWorld().entityTree
): void {
  const frontier = [[node]]
  while (frontier.length > 0) {
    const items = frontier.pop()!
    let idx = 0
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i]
      if (pred(item)) {
        cb(item, idx)
        idx += 1
        const children = item.children
        if (children && children.length > 0) {
          frontier.push(children.filter((x) => tree.entityNodeMap.has(x)).map((x) => tree.entityNodeMap.get(x)!))
        }
      }
    }
  }
}

/**
 * Traverse parent nodes for given Entity Tree Node
 * @param node Node for which traversal will occur
 * @param cb Callback function which will be called for every traverse
 * @param tree Entity Tree
 */
export function traverseEntityNodeParent(
  node: EntityTreeNode,
  cb: (parent: EntityTreeNode) => void,
  tree = useWorld().entityTree
): void {
  if (node.parentEntity) {
    const parent = tree.entityNodeMap.get(node.parentEntity)

    if (parent) {
      cb(parent)
      traverseEntityNodeParent(parent, cb, tree)
    }
  }
}

/**
 * Checks whether the type of object is `EntityTreeNode` of not
 * @param node Object to check type of
 * @returns Whether the object is `EntityTreeNode` or not
 */
export function isEntityNode(node: any): node is EntityTreeNode {
  return node.type === 'EntityNode'
}

/**
 * Creates Entity Tree Node array from passed Entity array
 * @param entities Entity Array to get Entity node from
 * @param tree Entity Tree object
 * @returns Entity Tree node array obtained from passed Entities.
 */
export function getEntityNodeArrayFromEntities(entities: Entity[], tree = useWorld().entityTree): EntityTreeNode[] {
  const arr = [] as EntityTreeNode[]

  for (const entity of entities) {
    const node = tree.entityNodeMap.get(entity)
    if (node) arr.push(node)
  }

  return arr
}

/**
 * Finds the index of an entity tree node using entity.
 * This function is useful for node which is not contained in array but can have same entity as one of array elements
 * @param arr Nodes array
 * @param node Node to find index of
 * @returns index of the node if found -1 oterhwise.
 */
export function findIndexOfEntityNode(arr: EntityTreeNode[], node: EntityTreeNode): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].entity === node.entity) return i
  }

  return -1
}

// ========== Entity Tree Node Functions ========== //
