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

import { useEffect } from 'react'
import { Box3, Box3Helper, BufferGeometry, Mesh, Vector3 } from 'three'

import {
  EntityTreeComponent,
  UndefinedEntity,
  createEntity,
  iterateEntityNode,
  removeEntity,
  useEntityContext
} from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../../common/NameComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '../../renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { T } from '../../schema/schemaFunctions'
import { TransformComponent } from './TransformComponent'

export const BOUNDING_BOX_COLORS = {
  SELECTED: 'white',
  HOVERED: '#F3A2FF'
} as const

export const BoundingBoxComponent = defineComponent({
  name: 'BoundingBoxComponent',

  schema: S.Object({
    box: T.Box3(),
    helper: S.Entity(),
    color: T.Color('white')
  }),

  reactor: function () {
    const entity = useEntityContext()
    const boundingBox = useComponent(entity, BoundingBoxComponent)

    useEffect(() => {
      const helperEntity = createEntity()

      const helper = new Box3Helper(boundingBox.box.value, boundingBox.color.value)
      helper.name = `bounding-box-helper-${entity}`

      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, VisibleComponent)

      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })

      setComponent(helperEntity, ObjectComponent, helper)
      ObjectLayerMaskComponent.setLayer(helperEntity, ObjectLayers.NodeHelper)
      boundingBox.helper.set(helperEntity)

      TransformComponent.dirty[entity] = 1 //used to dirty trasform and set the appropate bounding box
      updateBoundingBox(entity)

      return () => {
        removeEntity(helperEntity)
      }
    }, [])

    useEffect(() => {
      const helperEntity = boundingBox.helper.value
      if (helperEntity === UndefinedEntity) return

      const helperObject = getComponent(helperEntity, ObjectComponent) as any as Box3Helper
      ;(helperObject.material as any).color.set(boundingBox.color.value)
    }, [boundingBox.helper, boundingBox.color])

    return null
  }
})

export const updateBoundingBox = (entity: Entity) => {
  const boxComponent = getOptionalComponent(entity, BoundingBoxComponent)

  if (!boxComponent) {
    console.error('BoundingBoxComponent not found in updateBoundingBox')
    return
  }

  const box = boxComponent.box
  box.makeEmpty()

  // Collect all meshes first
  const meshes: Mesh<BufferGeometry>[] = []
  const callback = (child: Entity) => {
    const meshObject = getOptionalComponent(child, MeshComponent)
    if (meshObject) {
      meshes.push(meshObject)
    }
  }

  iterateEntityNode(entity, callback)

  // Calculate unified offset based on all meshes
  const calculatedOffset = calculateUnifiedMeshOffset(meshes)

  // Apply the unified offset to all meshes
  for (const meshObject of meshes) {
    expandBoxByObjectWithOffset(meshObject, box, calculatedOffset)
  }

  /** helper has custom logic in updateMatrixWorld */
  const boundingBox = getComponent(entity, BoundingBoxComponent)
  const helperEntity = boundingBox.helper
  if (!helperEntity) return

  const helperObject = getComponent(helperEntity, ObjectComponent) as any as Box3Helper
  helperObject.updateMatrixWorld(true)
  helperObject.position.set(0, 0, 0)
}

const calculateUnifiedMeshOffset = (meshes: Mesh<BufferGeometry>[]): Vector3 => {
  if (meshes.length === 0) return new Vector3()

  // Create a combined bounding box of all geometries in local space
  const combinedBox = new Box3()
  combinedBox.makeEmpty()

  for (const meshObject of meshes) {
    const geometry = meshObject.geometry
    if (!geometry) continue

    //if (geometry.boundingBox === null) {
    geometry.computeBoundingBox()
    //}

    combinedBox.union(geometry.boundingBox!)
  }

  // Get the center of the combined geometry bounds
  const combinedCenter = combinedBox.getCenter(new Vector3())

  // Return negated center to offset bounding box to origin
  return combinedCenter.negate()
}

const _box = new Box3()

export const expandBoxByObject = (object: Mesh<BufferGeometry>, box: Box3) => {
  const geometry = object.geometry
  if (!geometry) return

  if (geometry.boundingBox === null) {
    geometry.computeBoundingBox()
  }

  _box.copy(geometry.boundingBox!)
  _box.applyMatrix4(object.matrixWorld)
  box.union(_box)
}

export const expandBoxByObjectWithOffset = (object: Mesh<BufferGeometry>, box: Box3, offset?: Vector3) => {
  const geometry = object.geometry
  if (!geometry) return

  if (geometry.boundingBox === null) {
    geometry.computeBoundingBox()
  }

  _box.copy(geometry.boundingBox!)

  // Apply offset before world transform
  if (offset) {
    _box.translate(offset)
  }

  _box.applyMatrix4(object.matrixWorld)
  box.union(_box)
}

export const BoundingBoxComponentFunctions = {
  expandBoxByObject,
  expandBoxByObjectWithOffset
}
