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

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { addWorldObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { Box3, Color, Mesh, MeshStandardMaterial, SphereGeometry } from 'three'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { BoundingBoxComponent, computeBoundingBox } from '../../interaction/components/BoundingBoxComponents'
import { TransformSystem } from '../../transform/TransformModule'

export const ObjectGridSnapComponent = defineComponent({
  name: 'Object Grid Snap Component',
  jsonID: 'object-grid-snap',

  onInit: (entity) => {
    return {
      density: 1 as number,
      bbox: new Box3()
    }
  },
  onSet: (entity, component, json) => {
    if (!json) return
  },
  toJSON: (entity, component) => {
    return {
      density: component.density.value
    }
  },
  reactor: () => {
    const entity = useEntityContext()

    const snapComponent = useComponent(entity, ObjectGridSnapComponent)

    useExecute(
      () => {
        const testDot1 = new Mesh(new SphereGeometry(1), new MeshStandardMaterial())
        const testDot2 = new Mesh(new SphereGeometry(1), new MeshStandardMaterial())

        const boundingBoxComponent = getComponent(entity as Entity, BoundingBoxComponent)
        const objectSpaceBoundingBox = new Box3()
        const worldSpaceBoundingBox = boundingBoxComponent.box
        objectSpaceBoundingBox.copy(worldSpaceBoundingBox)
        const objectSpaceMatrix = getComponent(entity, TransformComponent).matrixInverse
        objectSpaceBoundingBox.applyMatrix4(objectSpaceMatrix)

        computeBoundingBox(entity)
        console.log(getComponent(entity, BoundingBoxComponent).box.max)
        console.log(getComponent(entity, BoundingBoxComponent).box.min)

        const min = objectSpaceBoundingBox.min
        const max = objectSpaceBoundingBox.max

        const testDot3 = new Mesh(new SphereGeometry(0.12), new MeshStandardMaterial())
        testDot3.material.color = new Color(0xd1f589)
        testDot3.position.copy(getComponent(entity, BoundingBoxComponent).box.max)
        addWorldObjectToGroup(entity, testDot3)
        const testDot4 = new Mesh(new SphereGeometry(0.12), new MeshStandardMaterial())
        testDot4.material.color = new Color(0xd1f589)
        testDot4.position.copy(getComponent(entity, BoundingBoxComponent).box.min)
        addWorldObjectToGroup(entity, testDot4)
      },
      { after: TransformSystem }
    )
    return null
  }
})
