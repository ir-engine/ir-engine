/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
