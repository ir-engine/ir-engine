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
  getMutableComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { NO_PROXY } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { ArrowHelper, Box3, Euler, Mesh, Quaternion, Vector3 } from 'three'
import { iterateEntityNode } from '../../ecs/functions/EntityTree'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { TransformSystem, computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { addWorldObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { MeshComponent } from './MeshComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'

export type AttachmentPointData = {
  position: Vector3
  rotation: Quaternion
  helper?: ArrowHelper
}

export const ObjectGridSnapComponent = defineComponent({
  name: 'Object Grid Snap Component',
  jsonID: 'object-grid-snap',

  onInit: (entity) => {
    return {
      density: 1 as number,
      bbox: new Box3(),
      attachmentPoints: [] as AttachmentPointData[]
    }
  },
  onSet: (entity, component, json) => {
    if (!json) return
    //if (typeof json.density === 'number') component.density.set(json.density)
    if (typeof json.bbox === 'object' && json.bbox.isBox3) component.bbox.set(json.bbox)
    if (typeof json.attachmentPoints === 'object' && Array.isArray(json.attachmentPoints))
      component.attachmentPoints.set(json.attachmentPoints)
  },
  toJSON: (entity, component) => {
    return {
      density: component.density.value
    }
  },
  reactor: () => {
    const entity = useEntityContext()

    const snapComponent = useComponent(entity, ObjectGridSnapComponent)

    const assetLoading = useOptionalComponent(entity, SceneAssetPendingTagComponent)

    useEffect(() => {
      if (assetLoading?.value) return
      const originalPosition = new Vector3()
      const originalRotation = new Quaternion()
      const originalScale = new Vector3()
      getComponent(entity, TransformComponent).matrix.decompose(originalPosition, originalRotation, originalScale)
      //set entity transform to identity before calculating bounding box
      setComponent(entity, TransformComponent, {
        position: new Vector3(),
        rotation: new Quaternion().identity(),
        scale: new Vector3(1, 1, 1)
      })
      const meshes: Mesh[] = []
      //iterate through children and update their transforms to reflect identity from parent
      iterateEntityNode(entity, (childEntity: Entity) => {
        computeTransformMatrix(childEntity)
        if (hasComponent(childEntity, MeshComponent)) {
          meshes.push(getComponent(childEntity, MeshComponent))
        }
      })
      //compute bounding box
      const bbox = new Box3()
      if (meshes.length > 0) {
        bbox.setFromObject(meshes[0])
        for (let i = 1; i < meshes.length; i++) {
          bbox.expandByObject(meshes[i])
        }
      }
      //set bounding box in component
      setComponent(entity, ObjectGridSnapComponent, {
        bbox
      })
      //set entity transform back to original
      setComponent(entity, TransformComponent, {
        position: originalPosition,
        rotation: originalRotation,
        scale: originalScale
      })
      iterateEntityNode(entity, computeTransformMatrix)
    }, [assetLoading])

    useEffect(() => {
      //if no bounding box, return
      if (!snapComponent.bbox.value || snapComponent.bbox.value.isEmpty()) return
      //generate grid of attachment points on every side of the bounding box
      const bbox = snapComponent.bbox.value
      const density = snapComponent.density.value
      const attachmentPoints: AttachmentPointData[] = []
      const bboxSize = bbox.getSize(new Vector3())
      const bboxMin = bbox.min
      const bboxMax = bbox.max
      //top side
      if (snapComponent.attachmentPoints.value.length > 0) {
        for (const attachmentPoint of snapComponent.attachmentPoints.value) {
          if (attachmentPoint.helper) removeObjectFromGroup(entity, attachmentPoint.helper)
        }
      }

      const generateHelper = (color: number) => {
        return new ArrowHelper(new Vector3(0, 0, 1), new Vector3(), 0.5, color, 0.2, 0.1)
      }

      const generateAttachmentPointsForSide = (
        side: 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back',
        color: number
      ) => {
        let minI = bboxMin.x
        let minJ = bboxMin.z
        let sizeI = bboxSize.x
        let sizeJ = bboxSize.z
        switch (side) {
          case 'top':
            minI = bboxMin.x
            minJ = bboxMin.z
            sizeI = bboxSize.x
            sizeJ = bboxSize.z
            break
          case 'bottom':
            minI = bboxMin.x
            minJ = bboxMin.z
            sizeI = bboxSize.x
            sizeJ = bboxSize.z
            break
          case 'left':
            minI = bboxMin.y
            minJ = bboxMin.z
            sizeI = bboxSize.y
            sizeJ = bboxSize.z
            break
          case 'right':
            minI = bboxMin.y
            minJ = bboxMin.z
            sizeI = bboxSize.y
            sizeJ = bboxSize.z
            break
          case 'front':
            minI = bboxMin.x
            minJ = bboxMin.y
            sizeI = bboxSize.x
            sizeJ = bboxSize.y
            break
          case 'back':
            minI = bboxMin.x
            minJ = bboxMin.y
            sizeI = bboxSize.x
            sizeJ = bboxSize.y
            break
        }
        const generatePositionAndRotation = (x, z) => {
          let position = new Vector3()
          let rotation = new Quaternion()
          switch (side) {
            // case 'top':
            //   position = new Vector3(x, bboxMax.y, z)
            //   rotation = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0))
            //   break
            // case 'bottom':
            //   position = new Vector3(x, bboxMin.y, z)
            //   rotation = new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0))
            //   break
            // case 'left':
            //   position = new Vector3(bboxMin.x, x, z)
            //   rotation = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0))
            //   break
            // case 'right':
            //   position = new Vector3(bboxMax.x, x, z)
            //   rotation = new Quaternion().setFromEuler(new Euler(0, -Math.PI / 2, 0))
            //   break
            // case 'front':
            //   position = new Vector3(x, bboxMin.y, z)
            //   rotation = new Quaternion().setFromEuler(new Euler(0, 0, 0))
            //   break
            // case 'back':
            //   position = new Vector3(x, bboxMin.y, z)
            //   rotation = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))
            //   break
            case 'top':
              position = new Vector3(x, bboxMax.y, z)
              rotation = new Quaternion().setFromEuler(new Euler(0, 0, 0))
              break
            case 'bottom':
              position = new Vector3(x, bboxMin.y, z)
              rotation = new Quaternion().setFromEuler(new Euler(Math.PI, 0, 0))
              break
            case 'left':
              position = new Vector3(bboxMin.x, x, z)
              rotation = new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 2))
              break
            case 'right':
              position = new Vector3(bboxMax.x, x, z)
              rotation = new Quaternion().setFromEuler(new Euler(0, 0, -Math.PI / 2))
              break
            case 'front':
              position = new Vector3(x, z, bboxMax.z)
              rotation = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0))
              break
            case 'back':
              position = new Vector3(x, z, bboxMin.z)
              rotation = new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0))
              break
          }
          return {
            position,
            rotation
          }
        }
        if (density === 1) {
          const x = minI + sizeI / 2
          const z = minJ + sizeJ / 2
          const helper = generateHelper(color)
          addWorldObjectToGroup(entity, helper)
          const { position, rotation } = generatePositionAndRotation(x, z)
          attachmentPoints.push({
            position,
            rotation,
            helper
          })
        } else {
          for (let i = 0; i < density; i++) {
            for (let j = 0; j < density; j++) {
              const x = minI + (sizeI / (density - 1)) * i
              const z = minJ + (sizeJ / (density - 1)) * j
              //const helper = new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial({ color: 0xFF0000 }))
              const helper = generateHelper(color)
              addWorldObjectToGroup(entity, helper)
              //attachment points point up in local space
              const { position, rotation } = generatePositionAndRotation(x, z)
              attachmentPoints.push({
                position,
                rotation,
                helper
              })
            }
          }
        }
      }
      //top side
      generateAttachmentPointsForSide('top', 0x00ffff)
      //bottom side
      generateAttachmentPointsForSide('bottom', 0xff0000)
      //left side
      generateAttachmentPointsForSide('left', 0x0000ff)
      //right side
      generateAttachmentPointsForSide('right', 0xff00ff)
      //front side
      generateAttachmentPointsForSide('front', 0x00ff00)
      //back side
      generateAttachmentPointsForSide('back', 0xffff00)
      //set attachment points in component
      setComponent(entity, ObjectGridSnapComponent, {
        attachmentPoints
      })
    }, [snapComponent.density, snapComponent.bbox])

    useExecute(
      () => {
        const snapComponent = getMutableComponent(entity, ObjectGridSnapComponent)
        const transform = getComponent(entity, TransformComponent)
        const attachmentPoints = snapComponent.attachmentPoints
        //loop through all attachment points
        for (let i = 0; i < attachmentPoints.length; i++) {
          const attachmentPoint = attachmentPoints[i]
          const helper = attachmentPoint.helper.get(NO_PROXY)!
          helper.position.copy(attachmentPoint.position.value.clone().applyMatrix4(transform.matrix))
          helper.quaternion.copy(transform.rotation.clone().multiply(attachmentPoint.rotation.value))
        }
      },
      { after: TransformSystem }
    )
    return null
  }
})
