import { Matrix4 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, getOptionalComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { GroupComponent } from '../components/GroupComponent'

export const reparentObject3D = (node: Entity, parent: Entity, before?: Entity): void => {
  const _node = getComponent(node, EntityTreeComponent)
  const _parent = getComponent(parent, EntityTreeComponent)
  const _before = before ? getComponent(before, EntityTreeComponent) : undefined

  if (!_node || !_parent || !_node.parentEntity) return

  const group = getOptionalComponent(node, GroupComponent)
  if (!group) return
  const obj3d = group[0]
  const parentObj3d =
    _parent.parentEntity && hasComponent(parent, GroupComponent)
      ? getComponent(parent, GroupComponent)[0]
      : Engine.instance.scene

  if (obj3d.parent && obj3d.parent !== parentObj3d) {
    // Maintain world position when reparenting.
    parentObj3d.updateMatrixWorld()
    obj3d.parent.updateMatrixWorld()
    obj3d.applyMatrix4(new Matrix4().copy(parentObj3d.matrixWorld).invert().multiply(obj3d.parent.matrixWorld))
    obj3d.updateWorldMatrix(false, false)
  }

  obj3d.removeFromParent()

  if (_before) {
    const beforeObj3d = getComponent(before!, GroupComponent)[0]
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
