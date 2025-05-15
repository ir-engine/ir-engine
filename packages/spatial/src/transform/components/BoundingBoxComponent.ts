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
import { Box3, Box3Helper, BufferGeometry, Mesh } from 'three'

import { EntityTreeComponent, createEntity, iterateEntityNode, removeEntity, useEntityContext } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ActiveHelperComponent } from '../../common/ActiveHelperComponent'
import { NameComponent } from '../../common/NameComponent'
import { RendererState } from '../../renderer/RendererState'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { ObjectComponent } from '../../renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '../../renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { T } from '../../schema/schemaFunctions'
import { TransformComponent } from './TransformComponent'

export const BoundingBoxComponent = defineComponent({
  name: 'BoundingBoxComponent',

  schema: S.Object({
    box: T.Box3(),
    helper: S.Entity()
  }),

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility) // show all volumes
    const activeHelperComponent = useOptionalComponent(entity, ActiveHelperComponent)
    const boundingBox = useComponent(entity, BoundingBoxComponent)

    useEffect(() => {
      const helperEnabled =
        activeHelperComponent !== undefined &&
        activeHelperComponent.enabled.value &&
        (activeHelperComponent.hovered.value || activeHelperComponent.selected.value)

      const showVolume =
        activeHelperComponent !== undefined && activeHelperComponent.volumeControlled.value
          ? helperEnabled
          : debugEnabled.value
      if (!showVolume) return

      const helperEntity = createEntity()

      const helper = new Box3Helper(boundingBox.box.value, 'white')
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
        if (!hasComponent(entity, BoundingBoxComponent)) return
        boundingBox.helper.set(UndefinedEntity)
      }
    }, [
      debugEnabled,
      activeHelperComponent?.volumeControlled,
      activeHelperComponent?.enabled,
      activeHelperComponent?.hovered,
      activeHelperComponent?.selected
    ])

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

  const callback = (child: Entity) => {
    const obj = getOptionalComponent(child, MeshComponent)
    if (obj) expandBoxByObject(obj, box)
  }

  iterateEntityNode(entity, callback)

  /** helper has custom logic in updateMatrixWorld */
  const boundingBox = getComponent(entity, BoundingBoxComponent)
  const helperEntity = boundingBox.helper
  if (!helperEntity) return

  const helperObject = getComponent(helperEntity, ObjectComponent) as any as Box3Helper
  helperObject.updateMatrixWorld(true)
  helperObject.position.set(0, 0, 0)
}

const _box = new Box3()

const expandBoxByObject = (object: Mesh<BufferGeometry>, box: Box3) => {
  const geometry = object.geometry
  if (!geometry) return

  if (geometry.boundingBox === null) {
    geometry.computeBoundingBox()
  }

  _box.copy(geometry.boundingBox!)
  _box.applyMatrix4(object.matrixWorld)
  box.union(_box)
}

export const BoundingBoxComponentFunctions = {
  expandBoxByObject
}
