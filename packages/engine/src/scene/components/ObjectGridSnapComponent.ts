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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import {
  ArrowHelper,
  Box3,
  BoxGeometry,
  DoubleSide,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3
} from 'three'
import { EntityTreeComponent, iterateEntityNode } from '../../ecs/functions/EntityTree'
import { computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { ObjectLayers } from '../constants/ObjectLayers'
import { addObjectToGroup } from './GroupComponent'
import { MeshComponent } from './MeshComponent'
import { NameComponent } from './NameComponent'
import { ObjectLayerMaskComponent } from './ObjectLayerComponent'
import { SceneAssetPendingTagComponent } from './SceneAssetPendingTagComponent'
import { UUIDComponent } from './UUIDComponent'
import { VisibleComponent } from './VisibleComponent'

export type AttachmentPointData = {
  position: Vector3
  rotation: Quaternion
  helper?: Mesh | ArrowHelper
}

export function flipAround(rotation: Quaternion) {
  const localYAxis = new Vector3(1, 0, 0)
  localYAxis.applyQuaternion(rotation)
  return new Quaternion().setFromAxisAngle(localYAxis, Math.PI).multiply(rotation)
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

    const helperEntity = useHookstate(null as Entity | null)

    useEffect(() => {
      const helper = createEntity()
      setComponent(helper, NameComponent, 'helper')
      setComponent(helper, VisibleComponent)
      setComponent(helper, TransformComponent)
      setComponent(helper, UUIDComponent, MathUtils.generateUUID() as EntityUUID)
      setComponent(helper, EntityTreeComponent, { parentEntity: entity })
      setComponent(helper, ObjectLayerMaskComponent, ObjectLayers.NodeHelper)
      helperEntity.set(helper)
      return () => {
        removeEntity(helperEntity.value!)
      }
    }, [])

    useEffect(() => {
      if (assetLoading?.value) return
      const originalPosition = new Vector3()
      const originalRotation = new Quaternion()
      const originalScale = new Vector3()
      const originalParent = getComponent(entity, EntityTreeComponent).parentEntity
      const transform = getComponent(entity, TransformComponent)
      transform.matrix.decompose(originalPosition, originalRotation, originalScale)
      //set entity transform to identity before calculating bounding box
      setComponent(entity, EntityTreeComponent, { parentEntity: null })
      // setComponent(entity, TransformComponent, {
      //   position: new Vector3(),
      //   rotation: new Quaternion().identity(),
      //   scale: new Vector3(1, 1, 1)
      // })
      transform.matrixWorld.identity()
      TransformComponent.updateFromWorldMatrix(entity)
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
      setComponent(entity, EntityTreeComponent, { parentEntity: originalParent })
      setComponent(entity, TransformComponent, {
        position: originalPosition,
        rotation: originalRotation,
        scale: originalScale
      })
      iterateEntityNode(entity, computeTransformMatrix)
      const helperMesh = new Mesh(
        new BoxGeometry(...bbox.getSize(new Vector3())),
        new MeshBasicMaterial({ color: 0xff0000, side: DoubleSide })
      )

      addObjectToGroup(helperEntity.value!, helperMesh)
    }, [assetLoading])

    return null
  }
})
