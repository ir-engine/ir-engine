/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { setComponent, UndefinedEntity, useComponent } from '@ir-engine/ecs'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import BoxColliderIcon from '@ir-engine/ui/src/components/editor/assets/boxCollider.png'
import CylinderColliderIcon from '@ir-engine/ui/src/components/editor/assets/cylinderCollider.png'
import SphereColiderIcon from '@ir-engine/ui/src/components/editor/assets/sphereCollider.png'
import { useEffect } from 'react'
import { getIconGizmo } from '../../functions/gizmos/studioIconGizmoHelper'

export const ColliderHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const colliderComponent = useComponent(parentEntity, ColliderComponent)

  useEffect(() => {
    if (iconEntity === UndefinedEntity) return
    const icon = (shape = 'box') => {
      switch (shape) {
        case Shapes.Sphere:
        case Shapes.Capsule:
          return SphereColiderIcon
        case Shapes.Cylinder:
          return CylinderColliderIcon
        case Shapes.Box: /* fall-through */
        case Shapes.Plane:
        default:
          return BoxColliderIcon
      }
    }

    const iconHelper = getIconGizmo(icon(colliderComponent?.shape.value))
    setComponent(iconEntity, ObjectComponent, iconHelper)
  }, [iconEntity, colliderComponent.shape])

  return null
}
