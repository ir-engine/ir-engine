import { Matrix4 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '../../ecs/functions/EntityTree'
import { isEntityNode } from '../../ecs/functions/EntityTree'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { Object3DComponent } from '../components/Object3DComponent'

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

  const obj3d = getComponent(_node.entity, Object3DComponent)?.value
  if (!obj3d) return
  const parentObj3d =
    _parent.parentEntity && getComponent(_parent.entity, Object3DComponent)
      ? getComponent(_parent.entity, Object3DComponent).value
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
    const beforeObj3d = getComponent(_before.entity, Object3DComponent)?.value
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
