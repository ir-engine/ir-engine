import { Matrix4 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, getOptionalComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '../../ecs/functions/EntityTree'
import { isEntityNode } from '../../ecs/functions/EntityTree'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { GroupComponent } from '../components/GroupComponent'

export const reparentObject3D = (
  node: Entity | EntityTreeNode,
  parent: Entity | EntityTreeNode,
  before?: Entity | EntityTreeNode,
  tree = useWorld().entityTree
): void => {
  const _node = isEntityNode(node) ? node : tree.entityNodeMap.get(node)
  const _parent = isEntityNode(parent) ? parent : tree.entityNodeMap.get(parent)
  const _before = before ? (isEntityNode(before) ? before : tree.entityNodeMap.get(before)) : undefined

  if (!_node || !_parent || !_node.parentEntity) return

  const group = getOptionalComponent(_node.entity, GroupComponent)
  if (!group) return
  const obj3d = group[0]
  const parentObj3d =
    _parent.parentEntity && hasComponent(_parent.entity, GroupComponent)
      ? getComponent(_parent.entity, GroupComponent)[0]
      : Engine.instance.currentWorld.scene

  if (obj3d.parent && obj3d.parent !== parentObj3d) {
    // Maintain world position when reparenting.
    parentObj3d.updateMatrixWorld()
    obj3d.parent.updateMatrixWorld()
    obj3d.applyMatrix4(new Matrix4().copy(parentObj3d.matrixWorld).invert().multiply(obj3d.parent.matrixWorld))
    obj3d.updateWorldMatrix(false, false)
  }

  obj3d.removeFromParent()

  if (_before) {
    const beforeObj3d = getComponent(_before.entity, GroupComponent)[0]
    if (beforeObj3d) {
      const newObjectIndex = parentObj3d.children.indexOf(beforeObj3d)
      parentObj3d.children.splice(newObjectIndex, 0, obj3d)
    } else {
      parentObj3d.children.push(obj3d)
    }
  } else {
    parentObj3d.children.push(obj3d)
  }

  obj3d.parent = parentObj3d
  obj3d.updateMatrixWorld(true)
}
