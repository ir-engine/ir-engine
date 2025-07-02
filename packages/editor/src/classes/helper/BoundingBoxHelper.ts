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

import {
  createEntity,
  EntityTreeComponent,
  getComponent,
  removeEntity,
  setComponent,
  UndefinedEntity,
  useComponent
} from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import {
  BoundingBoxComponent,
  updateBoundingBox
} from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { useEffect } from 'react'
import { Box3Helper } from 'three'

export const BOUNDING_BOX_COLORS = {
  SELECTED: 'white',
  HOVERED: '#F3A2FF'
} as const

export const BoundingBoxHelperReactor: React.FC = (props: { parentEntity; iconEntity; selected; hovered }) => {
  const { parentEntity, iconEntity, selected, hovered } = props

  const boundingBox = useComponent(parentEntity, BoundingBoxComponent)

  useEffect(() => {
    if (!(selected || hovered)) return

    const helperEntity = createEntity()

    const helper = new Box3Helper(boundingBox.box.value, boundingBox.color.value)
    helper.name = `bounding-box-helper-${parentEntity}`

    setComponent(helperEntity, NameComponent, helper.name)
    setComponent(helperEntity, VisibleComponent)

    setComponent(helperEntity, EntityTreeComponent, { parentEntity })

    setComponent(helperEntity, ObjectComponent, helper)
    ObjectLayerMaskComponent.setLayer(helperEntity, ObjectLayers.NodeHelper)
    boundingBox.helper.set(helperEntity)

    TransformComponent.dirty[parentEntity] = 1 //used to dirty trasform and set the appropate bounding box
    updateBoundingBox(parentEntity)

    return () => {
      removeEntity(helperEntity)
    }
  }, [selected, hovered])

  useEffect(() => {
    const helperEntity = boundingBox.helper.value
    if (helperEntity === UndefinedEntity) return

    const helperObject = getComponent(helperEntity, ObjectComponent) as any as Box3Helper
    ;(helperObject.material as any).color.set(boundingBox.color.value)
  }, [boundingBox.helper, boundingBox.color])

  return null
}
