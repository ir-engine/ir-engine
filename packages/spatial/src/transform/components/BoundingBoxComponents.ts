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

import { useEffect } from 'react'
import { Box3, Box3Helper, BufferGeometry, Mesh } from 'three'

import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { EntityTreeComponent, iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Matrix4 } from 'three'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '../../common/NameComponent'
import { addObjectToGroup, GroupComponent } from '../../renderer/components/GroupComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { setObjectLayers } from '../../renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { RendererState } from '../../renderer/RendererState'

export const BoundingBoxComponent = defineComponent({
  name: 'BoundingBoxComponent',

  schema: S.Object({
    worldSpaceBox: S.Class(() => new Box3()),
    objectSpaceBox: S.Class(() => new Box3()),
    helper: S.Entity()
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.worldSpaceBox?.isBox3) component.worldSpaceBox.value.copy(json.worldSpaceBox)
    if (json.objectSpaceBox?.isBox3) component.objectSpaceBox.value.copy(json.objectSpaceBox)
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const boundingBox = useComponent(entity, BoundingBoxComponent)

    useEffect(() => {
      updateBoundingBox(entity)

      if (!debugEnabled.value) return

      const helperEntity = createEntity()

      const helper = new Box3Helper(boundingBox.worldSpaceBox.value)
      helper.name = `bounding-box-helper-${entity}`

      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, VisibleComponent)

      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })

      addObjectToGroup(helperEntity, helper)
      setObjectLayers(helper, ObjectLayers.NodeHelper)
      boundingBox.helper.set(helperEntity)

      return () => {
        removeEntity(helperEntity)
        if (!hasComponent(entity, BoundingBoxComponent)) return
        boundingBox.helper.set(UndefinedEntity)
      }
    }, [debugEnabled])

    return null
  }
})

export const updateBoundingBox = (entity: Entity) => {
  const boxComponent = getOptionalComponent(entity, BoundingBoxComponent)

  if (!boxComponent) {
    console.error('BoundingBoxComponent not found in updateBoundingBox')
    return
  }

  const worldBox = boxComponent.worldSpaceBox
  const objectBox = boxComponent.objectSpaceBox
  worldBox.makeEmpty()
  objectBox.makeEmpty()

  const callback = (child: Entity) => {
    const obj = getOptionalComponent(child, MeshComponent)
    if (obj) expandBoxByObject(obj, entity, worldBox, objectBox)
  }

  iterateEntityNode(entity, callback)

  /** helper has custom logic in updateMatrixWorld */
  const boundingBox = getComponent(entity, BoundingBoxComponent)
  const helperEntity = boundingBox.helper
  if (!helperEntity) return

  const helperObject = getComponent(helperEntity, GroupComponent)?.[0] as any as Box3Helper
  helperObject.box = worldBox
  helperObject.updateMatrixWorld(true)
}

const _box = new Box3()
const _worldBox = new Box3()
const _localBox = new Box3()

const expandBoxByObject = (object: Mesh<BufferGeometry>, parentEntity: Entity, worldBox: Box3, objectBox: Box3) => {
  const geometry = object.geometry

  if (geometry) {
    if (geometry.boundingBox === null) {
      geometry.computeBoundingBox()
    }

    _box.copy(geometry.boundingBox!)
    
    // Update world space box
    _worldBox.copy(_box).applyMatrix4(object.matrixWorld)
    worldBox.union(_worldBox)

    // Update object space box (local to the parent entity)
    const parentWorldMatrix = getComponent(parentEntity, TransformComponent).matrix
    const parentWorldMatrixInverse = new Matrix4().copy(parentWorldMatrix).invert()
    _localBox.copy(_worldBox).applyMatrix4(parentWorldMatrixInverse)
    objectBox.union(_localBox)
  }
}
