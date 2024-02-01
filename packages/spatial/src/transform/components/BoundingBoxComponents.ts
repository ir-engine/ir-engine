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

import { useEffect } from 'react'
import { Box3, Box3Helper, BufferGeometry, Mesh } from 'three'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { EntityTreeComponent, iterateEntityNode } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { NameComponent } from '../../common/NameComponent'
import { matches } from '../../common/functions/MatchesUtils'
import { RendererState } from '../../renderer/RendererState'
import { GroupComponent, addObjectToGroup } from '../../renderer/components/GroupComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { setObjectLayers } from '../../renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'

export const BoundingBoxComponent = defineComponent({
  name: 'BoundingBoxComponent',

  onInit: (entity) => {
    return {
      box: new Box3(),
      helper: UndefinedEntity
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.box)) component.box.value.copy(json.box)
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).nodeHelperVisibility)
    const boundingBox = useComponent(entity, BoundingBoxComponent)

    useEffect(() => {
      updateBoundingBox(entity)

      if (!debugEnabled.value) return

      const helperEntity = createEntity()

      const helper = new Box3Helper(boundingBox.box.value)
      helper.name = `bounding-box-helper-${entity}`

      setComponent(helperEntity, NameComponent, helper.name)
      setComponent(helperEntity, VisibleComponent)

      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })

      addObjectToGroup(helperEntity, helper)
      setObjectLayers(helper, ObjectLayers.NodeHelper)
      boundingBox.helper.set(helperEntity)

      return () => {
        removeEntity(helperEntity)
        boundingBox.helper.set(UndefinedEntity)
      }
    }, [debugEnabled])

    return null
  }
})

export const updateBoundingBox = (entity: Entity) => {
  const box = getComponent(entity, BoundingBoxComponent).box

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

  const helperObject = getComponent(helperEntity, GroupComponent)?.[0] as any as Box3Helper
  helperObject.updateMatrixWorld(true)
}

const _box = new Box3()

const expandBoxByObject = (object: Mesh<BufferGeometry>, box: Box3) => {
  const geometry = object.geometry

  if (geometry) {
    if (geometry.boundingBox === null) {
      geometry.computeBoundingBox()
    }

    _box.copy(geometry.boundingBox!)
    _box.applyMatrix4(object.matrixWorld)
    box.union(_box)
  }
}
