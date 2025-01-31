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

import { EntityTreeComponent, useQuery, UUIDComponent } from '@ir-engine/ecs'
import { ComponentJSONIDMap, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity, entityExists, generateEntityUUID } from '@ir-engine/ecs/src/EntityFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { GLTFNodeState } from '@ir-engine/engine/src/gltf/GLTFDocumentState'
import { getMutableState, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { ActiveHelperComponent } from '@ir-engine/spatial/src/common/ActiveHelperComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { CircleGeometry, Mesh } from 'three'
import { ComponentStudioIconState } from '../services/ComponentStudioIcons'
import { SelectionState } from '../services/SelectionServices'

const sphereGeometry = new CircleGeometry(0.5, 64)

const createIconHelper = (name, icon, parentEntity) => {
  console.log('DEBUG: creating icon helper for ', name)
  const helperEntity = createEntity()
  const helper = new Mesh(sphereGeometry)
  setComponent(helperEntity, NameComponent, `${name ?? parentEntity}-icon-helper`)
  setComponent(helperEntity, EntityTreeComponent, { parentEntity: parentEntity })
  setComponent(helperEntity, TransformComponent)
  setComponent(helperEntity, ObjectComponent, helper)
  setComponent(helperEntity, UUIDComponent, generateEntityUUID())
  setComponent(helperEntity, ObjectLayerMaskComponent, ObjectLayerMasks.NodeHelper)
  setComponent(helperEntity, VisibleComponent, true)
  return helperEntity
}

const reactor = () => {
  const selectedEntities = useHookstate(getMutableState(SelectionState).selectedEntities)
  const componentStudioIconState = useHookstate(getMutableState(ComponentStudioIconState))
  const helperQuery = useQuery([ActiveHelperComponent])

  useEffect(() => {
    const entities = [...selectedEntities.value].map(UUIDComponent.getEntityByUUID)
    for (const entity of entities) {
      if (!entityExists(entity)) continue
      setComponent(entity, ActiveHelperComponent, true)
    }
    return () => {
      for (const entity of entities) {
        if (!entityExists(entity)) continue
        setComponent(entity, ActiveHelperComponent, false)
      }
    }
  }, [selectedEntities])

  useEffect(() => {
    console.log('DEBUG: helper query ', helperQuery)
    for (const entity of helperQuery) {
      //find the top most component
      //set icon helper accordingly
      const componentStudioIcon = componentStudioIconState.get(NO_PROXY)
      const node = GLTFNodeState.getMutableNode(entity).get(NO_PROXY)
      let targetComponent: any = undefined
      for (const jsonID of Object.keys(node.extensions!)) {
        const component = ComponentJSONIDMap.get(jsonID)!
        if (componentStudioIcon[component?.name]) {
          targetComponent = component
          break
        }
      }
      createIconHelper(targetComponent.name, componentStudioIcon[targetComponent.name], entity)

      // create the icon helper
    }
  }, [helperQuery])

  return null
}

export const HelperActiveSystem = defineSystem({
  uuid: 'ee.engine.HelperActiveSystem',
  insert: { before: PresentationSystemGroup },
  reactor
})
