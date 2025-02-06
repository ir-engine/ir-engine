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

import { defineQuery, EngineState, UndefinedEntity, useQuery, UUIDComponent } from '@ir-engine/ecs'
import { ComponentJSONIDMap, getComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { entityExists } from '@ir-engine/ecs/src/EntityFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { GLTFNodeState } from '@ir-engine/engine/src/gltf/GLTFDocumentState'
import { getMutableState, getState, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { ActiveHelperComponent } from '@ir-engine/spatial/src/common/ActiveHelperComponent'
import { createHelperEntity } from '@ir-engine/spatial/src/common/debug/useHelperEntity'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputHeuristicState, IntersectionData } from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks, ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { Raycaster, Sprite, SpriteMaterial, TextureLoader, Vector3 } from 'three'
import { iconGizmoArrow, setupGizmo } from '../constants/GizmoPresets'
import { ComponentStudioIconState } from '../services/ComponentStudioIcons'
import { SelectionState } from '../services/SelectionServices'

const createIconGizmo = (textureURL) => {
  const texture = new TextureLoader().load(textureURL)
  const material = new SpriteMaterial({ map: texture })
  return new Sprite(material)
}

const raycaster = new Raycaster()
raycaster.layers.enable(ObjectLayers.NodeHelper)

const inputObjectsQuery = defineQuery([InputComponent, VisibleComponent, ObjectComponent])

export function nodeHelperInputHeuristic(
  intersectionData: Set<IntersectionData>,
  position: Vector3,
  direction: Vector3
) {
  const isEditing = getState(EngineState).isEditing
  if (!isEditing) return

  raycaster.set(position, direction)
  raycaster.camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent).cameras[0]

  //concatenating cameraGizmo to both pickerObjects(transformGizmo) and inputObjects
  const inputObj = inputObjectsQuery()

  const objects = inputObj.map((eid) => getComponent(eid, ObjectComponent))
  // gizmo heuristic

  //camera gizmos layer should always be active here, since it doesn't disable based on transformGizmo existing
  const hits = raycaster.intersectObjects(objects, true)
  for (const hit of hits) {
    intersectionData.add({ entity: hit.object.entity!, distance: hit.distance })
  }
}

const reactor = () => {
  const selectedEntities = useHookstate(getMutableState(SelectionState).selectedEntities)
  const componentStudioIconState = useHookstate(getMutableState(ComponentStudioIconState))
  const helperQuery = useQuery([ActiveHelperComponent])

  useEffect(() => {
    const entities = [...selectedEntities.value].map(UUIDComponent.getEntityByUUID)
    for (const entity of entities) {
      if (!entityExists(entity)) continue
      setComponent(entity, ActiveHelperComponent, { enabled: true })
    }
    return () => {
      for (const entity of entities) {
        if (!entityExists(entity)) continue
        setComponent(entity, ActiveHelperComponent, { enabled: false })
      }
    }
  }, [selectedEntities])

  useEffect(() => {
    for (const entity of helperQuery) {
      //find the top most component
      //set icon helper accordingly
      if (getComponent(entity, ActiveHelperComponent).helperDefaultGizmo !== UndefinedEntity) continue
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

      const iconHelper = createHelperEntity(
        entity,
        () => {
          const iconGizmo = createIconGizmo(componentStudioIcon[targetComponent?.name])
          if (getComponent(entity, ActiveHelperComponent).directional)
            setupGizmo(entity, iconGizmoArrow, ObjectLayers.NodeHelper)
          return iconGizmo
        },
        ObjectLayerMasks.NodeHelper,
        'icon-helper'
      )
      setComponent(entity, ActiveHelperComponent, { helperDefaultGizmo: iconHelper })
      // create the icon helper
    }
  }, [helperQuery])

  useEffect(() => {
    getMutableState(InputHeuristicState).merge([
      {
        order: 1,
        heuristic: nodeHelperInputHeuristic
      }
    ])
  }, [])

  return null
}

export const HelperActiveSystem = defineSystem({
  uuid: 'ee.engine.HelperActiveSystem',
  insert: { before: PresentationSystemGroup },
  reactor
})
