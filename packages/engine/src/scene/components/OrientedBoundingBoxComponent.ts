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

import { Box3 } from 'three'

import { iterateEntityNode } from '@ir-engine/ecs'
import { defineComponent, getOptionalComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { expandBoxByObject } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

export const OrientedBoundingBoxComponent = defineComponent({
  name: 'OrientedBoundingBoxComponent',

  schema: S.Object({
    box: T.Box3()
  })
})

export const updateBoundingBox = (entity: Entity) => {
  const boxComponent = getOptionalComponent(entity, OrientedBoundingBoxComponent)

  if (!boxComponent) {
    console.error('BoundingBoxComponent not found in updateBoundingBox')
    return
  }

  const transform = getOptionalComponent(entity, TransformComponent)
  if (!transform) {
    console.error('TransformComponent not found in updateBoundingBox')
    return
  }

  //set entity transform to identity before calculating bounding box so it is in object space
  const originalMatrixWorld = transform.matrixWorld.clone()
  transform.matrixWorld.identity()
  TransformComponent.updateFromWorldMatrix(entity)
  TransformComponent.computeTransformMatrixWithChildren(entity)

  const box = new Box3()
  box.makeEmpty()

  const callback = (child: Entity) => {
    const obj = getOptionalComponent(child, MeshComponent)
    const coll = getOptionalComponent(child, ColliderComponent)
    if (obj && !coll) expandBoxByObject(obj, box)
  }

  iterateEntityNode(entity, callback)

  //reset entity transform
  transform.matrixWorld.copy(originalMatrixWorld)
  TransformComponent.updateFromWorldMatrix(entity)
  TransformComponent.computeTransformMatrixWithChildren(entity)

  setComponent(entity, OrientedBoundingBoxComponent, { box })
}
