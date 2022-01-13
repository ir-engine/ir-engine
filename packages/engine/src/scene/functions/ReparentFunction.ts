import { Matrix4 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { EntityTreeNode } from '../../ecs/classes/EntityTree'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'

export const reparentObject3D = (node: EntityTreeNode, parent: EntityTreeNode, before?: EntityTreeNode): void => {
  if (!node.parentNode) return

  const obj3d = getComponent(node.entity, Object3DComponent)?.value
  if (!obj3d) return
  const parentObj3d = parent.parentNode ? getComponent(parent.entity, Object3DComponent).value : Engine.scene

  if (obj3d.parent && obj3d.parent !== parentObj3d) {
    // Maintain world position when reparenting.
    parentObj3d.updateMatrixWorld()
    obj3d.parent.updateMatrixWorld()
    obj3d.applyMatrix4(new Matrix4().copy(parentObj3d.matrixWorld).invert().multiply(obj3d.parent.matrixWorld))
    obj3d.updateWorldMatrix(false, false)
  }

  obj3d.removeFromParent()

  if (before) {
    const beforeObj3d = getComponent(before.entity, Object3DComponent).value
    const newObjectIndex = parentObj3d.children.indexOf(beforeObj3d)
    parentObj3d.children.splice(newObjectIndex, 0, obj3d)
  } else {
    parentObj3d.children.push(obj3d)
  }

  obj3d.parent = parentObj3d
  obj3d.updateMatrixWorld(true)
}
