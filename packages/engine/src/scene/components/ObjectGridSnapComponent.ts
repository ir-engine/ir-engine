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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getMutableState, useDidMount, useState } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { useHelperEntity } from '@ir-engine/spatial/src/common/debug/DebugComponentUtils'
import { LineSegmentComponent } from '@ir-engine/spatial/src/renderer/components/LineSegmentComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { EntityTreeComponent, iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { useEffect } from 'react'
import { Box3, BufferGeometry, LineBasicMaterial, Matrix4, Mesh, Quaternion, Vector3 } from 'three'
import { GLTFComponent } from '../../gltf/GLTFComponent'

function createBBoxGridGeometry(matrixWorld: Matrix4, bbox: Box3, density: number): BufferGeometry {
  const lineSegmentList: Vector3[] = []
  const size = new Vector3()
  bbox.getSize(size)

  // Create grid lines for each face of the bounding box

  // Front and back faces (parallel to XY plane)
  const zFront = bbox.min.z
  const zBack = bbox.max.z
  for (let j = 0; j <= density; j++) {
    const segmentFraction = j / density
    const x = bbox.min.x + segmentFraction * size.x
    const y = bbox.min.y + segmentFraction * size.y

    lineSegmentList.push(new Vector3(x, bbox.min.y, zFront), new Vector3(x, bbox.max.y, zFront))
    lineSegmentList.push(new Vector3(x, bbox.min.y, zBack), new Vector3(x, bbox.max.y, zBack))
    lineSegmentList.push(new Vector3(bbox.min.x, y, zFront), new Vector3(bbox.max.x, y, zFront))
    lineSegmentList.push(new Vector3(bbox.min.x, y, zBack), new Vector3(bbox.max.x, y, zBack))
  }

  // Top and bottom faces (parallel to XZ plane)
  const yTop = bbox.max.y
  const yBottom = bbox.min.y
  for (let j = 0; j <= density; j++) {
    const segmentFraction = j / density
    const x = bbox.min.x + segmentFraction * size.x
    const z = bbox.min.z + segmentFraction * size.z

    lineSegmentList.push(new Vector3(x, yTop, bbox.min.z), new Vector3(x, yTop, bbox.max.z))
    lineSegmentList.push(new Vector3(x, yBottom, bbox.min.z), new Vector3(x, yBottom, bbox.max.z))
    lineSegmentList.push(new Vector3(bbox.min.x, yTop, z), new Vector3(bbox.max.x, yTop, z))
    lineSegmentList.push(new Vector3(bbox.min.x, yBottom, z), new Vector3(bbox.max.x, yBottom, z))
  }

  // Left and right faces (parallel to YZ plane)
  const xLeft = bbox.min.x
  const xRight = bbox.max.x
  for (let j = 0; j <= density; j++) {
    const segmentFraction = j / density
    const y = bbox.min.y + segmentFraction * size.y
    const z = bbox.min.z + segmentFraction * size.z

    lineSegmentList.push(new Vector3(xLeft, y, bbox.min.z), new Vector3(xLeft, y, bbox.max.z))
    lineSegmentList.push(new Vector3(xRight, y, bbox.min.z), new Vector3(xRight, y, bbox.max.z))
    lineSegmentList.push(new Vector3(xLeft, bbox.min.y, z), new Vector3(xLeft, bbox.max.y, z))
    lineSegmentList.push(new Vector3(xRight, bbox.min.y, z), new Vector3(xRight, bbox.max.y, z))
  }
  for (let i = 0; i < lineSegmentList.length; i++) {
    lineSegmentList[i].applyMatrix4(matrixWorld)
  }

  return new BufferGeometry().setFromPoints(lineSegmentList)
}

export const BoundingBoxHelperComponent = defineComponent({
  name: 'BoundingBoxHelperComponent',

  schema: S.Object({
    name: S.String('bounding-box-helper'),
    bbox: S.Required(S.Type<Box3>()),
    density: S.Number(2),
    color: T.Color(0xff0000),
    layerMask: S.Number(ObjectLayerMasks.NodeHelper),
    entity: T.Entity()
  }),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, BoundingBoxHelperComponent)
    const helper = useHelperEntity(entity, component)
    const lineSegment = useOptionalComponent(helper, LineSegmentComponent)

    useEffect(() => {
      const bbox = component.bbox.value
      const density = component.density.value
      setComponent(helper, LineSegmentComponent, {
        name: 'bbox-line-segment-' + entity,
        geometry: createBBoxGridGeometry(new Matrix4().identity(), bbox, density),
        material: new LineBasicMaterial({ color: component.color.value }),
        layerMask: component.layerMask.value
      })
    }, [])

    useDidMount(() => {
      if (!lineSegment) return
      const bbox = component.bbox.value
      const density = component.density.value
      lineSegment.geometry.set(createBBoxGridGeometry(new Matrix4().identity(), bbox, density))
    }, [component.bbox])

    useEffect(() => {
      if (!lineSegment) return
      lineSegment.color.set(component.color.value)
    }, [component.color, lineSegment])

    useEffect(() => {
      if (!lineSegment) return
      lineSegment.layerMask.set(component.layerMask.value)
    }, [component.layerMask, lineSegment])

    return null
  }
})

const defaultMax = new Vector3(0.5, 0.5, 0.5)
const originalPosition = new Vector3()
const originalRotation = new Quaternion()
const originalScale = new Vector3()

export const ObjectGridSnapComponent = defineComponent({
  name: 'ObjectGridSnapComponent',

  schema: S.Object({
    bbox: S.Class(() => new Box3())
  }),

  reactor: () => {
    const entity = useEntityContext()
    const engineState = useState(getMutableState(EngineState))
    const gltfLoaded = GLTFComponent.useSceneLoaded(entity)
    const snapComponent = useComponent(entity, ObjectGridSnapComponent)

    useEffect(() => {
      if (!gltfLoaded) return
      const originalPosition = new Vector3()
      const originalRotation = new Quaternion()
      const originalScale = new Vector3()
      const originalParent = getComponent(entity, EntityTreeComponent).parentEntity
      const transform = getComponent(entity, TransformComponent)
      transform.matrix.decompose(originalPosition, originalRotation, originalScale)
      //set entity transform to identity before calculating bounding box
      setComponent(entity, EntityTreeComponent, { parentEntity: UndefinedEntity })
      transform.matrixWorld.identity()
      TransformComponent.updateFromWorldMatrix(entity)

      const meshes: Mesh[] = []
      //iterate through children and update their transforms to reflect identity from parent
      iterateEntityNode(entity, (childEntity: Entity) => {
        if (hasComponent(childEntity, TransformComponent)) {
          computeTransformMatrix(childEntity)
          if (hasComponent(childEntity, MeshComponent)) {
            meshes.push(getComponent(childEntity, MeshComponent))
          }
        }
      })

      //compute bounding box
      const bbox = snapComponent.bbox.value.makeEmpty()
      if (meshes.length > 0) {
        for (let i = 0; i < meshes.length; i++) {
          bbox.expandByObject(meshes[i])
        }
      } else {
        bbox.set(Vector3_Zero, defaultMax)
      }

      //set entity transform back to original
      setComponent(entity, EntityTreeComponent, { parentEntity: originalParent })
      setComponent(entity, TransformComponent, {
        position: originalPosition,
        rotation: originalRotation,
        scale: originalScale
      })

      iterateEntityNode(entity, computeTransformMatrix, (childEntity) => hasComponent(childEntity, TransformComponent))

      //set bounding box in component
      snapComponent.bbox.set(bbox)
    }, [gltfLoaded])

    useEffect(() => {
      if (!engineState.isEditing.value) return
      const bbox = snapComponent.bbox.value
      setComponent(entity, BoundingBoxHelperComponent, { bbox })

      return () => {
        removeComponent(entity, BoundingBoxHelperComponent)
      }
    }, [snapComponent.bbox, engineState.isEditing])

    return null
  }
})
