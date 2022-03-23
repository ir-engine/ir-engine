import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { DisableTransformTagComponent } from '@xrengine/engine/src/transform/components/DisableTransformTagComponent'

/**
 * Filters the parent entities from the given entity list.
 * In a given entity list, suppose 2 entities has parent child relation (can be any level deep) then this function will
 * filter out the child entity.
 * @param nodeList List of entities to find parents from
 * @param parentNodeList Resulter parent list
 * @param filterUnremovable Whether to filter unremovable entities
 * @param filterUntransformable Whether to filter untransformable entities
 * @returns List of parent entities
 */
export const filterParentEntities = (
  entityList: Entity[],
  parentEntityList: Entity[] = [],
  filterUnremovable = true,
  filterUntransformable = true,
  tree = useWorld().entityTree
): Entity[] => {
  parentEntityList.length = 0

  // Recursively find the nodes in the tree with the lowest depth
  const traverseParentOnly = (entity: Entity) => {
    const node = tree.entityNodeMap.get(entity)
    if (!node) return

    if (
      entityList.includes(entity) &&
      !(filterUnremovable && !node.parentEntity) &&
      !(filterUntransformable && hasComponent(entity, DisableTransformTagComponent))
    ) {
      parentEntityList.push(entity)
      return
    }

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        traverseParentOnly(node.children[i])
      }
    }
  }

  traverseParentOnly(tree.rootNode.entity)

  return parentEntityList
}
