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

import { defineQuery, EngineState, Entity, UndefinedEntity, UUIDComponent } from '@ir-engine/ecs'
import {
  getAllComponents,
  getAuthoringCounterpart,
  getComponent,
  setComponent,
  SimulationLayerComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs/src/ComponentFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { ActiveHelperComponent } from '@ir-engine/spatial/src/common/ActiveHelperComponent'
import { useHelperEntity } from '@ir-engine/spatial/src/common/debug/useHelperEntity'
import React from 'react'

import { QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'
import {
  HeuristicFunctions,
  InputHeuristicState,
  IntersectionData
} from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks, ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { Raycaster, Vector3 } from 'three'
import { TransformGizmoControlComponent } from '../classes/gizmo/transform/TransformGizmoControlComponent'
import { iconGizmoArrow, iconGizmoYHelper, setupGizmo } from '../constants/GizmoPresets'
import {
  getIconGizmo,
  gizmoIconHelperYAxisUpdate,
  gizmoIconUpdate,
  onPointerHover
} from '../functions/gizmos/studioIconGizmoHelper'
import { ComponentStudioIconState } from '../services/ComponentStudioIcons'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'
import { transformGizmoControllerQuery } from './TransformGizmoSystem'

const _raycaster = new Raycaster() // for heuristic
_raycaster.layers.enable(ObjectLayers.Helper) // only icons
_raycaster.firstHitOnly = true

const inputObjectsQuery = defineQuery([InputComponent, VisibleComponent, ObjectComponent])

export const studioIconGizmoInputHeuristic = (
  viewerEmtity: Entity = getState(ReferenceSpaceState).viewerEntity,
  intersectionData: Set<IntersectionData>,
  position: Vector3,
  direction: Vector3
) => {
  const isEditing = getState(EngineState).isEditing
  if (!isEditing) return

  const gizmoEnabled = getState(EditorHelperState).gizmoEnabled
  if (!gizmoEnabled) return

  _raycaster.set(position, direction)
  _raycaster.camera = getComponent(viewerEmtity, CameraComponent).cameras[0]

  const objects = inputObjectsQuery().map((eid) => getComponent(eid, ObjectComponent))

  const hits = _raycaster.intersectObjects(objects, true)

  for (const hit of hits) {
    intersectionData.add({ entity: hit.object.entity!, distance: hit.distance })
  }
}

const ActiveHelperReactor = () => {
  const entity = useEntityContext()
  const activeHelperComponent = useComponent(entity, ActiveHelperComponent)
  const componentStudioIcon = getState(ComponentStudioIconState)
  const engineState = useHookstate(getMutableState(EngineState))
  const selectedEntities = SelectionState.useSelectedEntities() // all authoring layer
  const editorHelperState = useHookstate(getMutableState(EditorHelperState))

  const entityComponents = getAllComponents(entity)
  const targetComponent: any = entityComponents.find((component) =>
    Object.keys(componentStudioIcon).find((key) => key === component.jsonID)
  )
  let studioIconTexture = componentStudioIcon[targetComponent?.jsonID]
  if (targetComponent?.jsonID === ColliderComponent.jsonID) {
    const colliderIconFunc = componentStudioIcon[targetComponent?.jsonID]
    studioIconTexture = colliderIconFunc(getComponent(entity, ColliderComponent).shape)
  }

  const studioIcon = useHelperEntity(
    entity,
    () => {
      const iconGizmo = getIconGizmo(studioIconTexture)
      iconGizmo.renderOrder = -1
      const lineEntitites = setupGizmo(
        getState(ReferenceSpaceState).originEntity,
        iconGizmoYHelper,
        ObjectLayers.Helper
      )
      activeHelperComponent.lineEntities.set(lineEntitites)

      if (getComponent(entity, ActiveHelperComponent).directional) {
        const directionalEntities = setupGizmo(entity, iconGizmoArrow, ObjectLayers.Helper)
        activeHelperComponent.directionalEntities.set(directionalEntities)
      }

      if (getComponent(entity, ActiveHelperComponent).volumeEnabled) {
        setComponent(entity, BoundingBoxComponent)
      }
      return iconGizmo
    },
    editorHelperState.gizmoEnabled.value && activeHelperComponent.enabled.value,
    ObjectLayerMasks.Helper,
    'icon-helper'
  )

  setComponent(entity, ActiveHelperComponent, { helperIconGizmo: studioIcon })

  InputComponent.useExecuteWithInput(
    () => {
      const activeHelperComponent = getComponent(entity, ActiveHelperComponent)
      if (activeHelperComponent === undefined) return
      if (activeHelperComponent.helperIconGizmo === UndefinedEntity) return
      gizmoIconUpdate(entity)

      const intersect = onPointerHover(entity)

      for (const lineEntity of activeHelperComponent.lineEntities) {
        setVisibleComponent(lineEntity, intersect && getState(EngineState).isEditing ? true : false)
        gizmoIconHelperYAxisUpdate(lineEntity, getComponent(entity, TransformComponent).position)
      }

      const transformGizmoControllerEntity = transformGizmoControllerQuery()
      if (!(selectedEntities.find((e) => e === entity) === undefined))
        if (
          transformGizmoControllerEntity.length > 0 &&
          getComponent(transformGizmoControllerEntity[0], TransformGizmoControlComponent).dragging
        )
          return

      const defaultGizmoButtons = InputComponent.getButtons(activeHelperComponent.helperIconGizmo)

      if (defaultGizmoButtons.PrimaryClick?.down) {
        SelectionState.updateSelection([UUIDComponent.get(entity)])
      }
    },
    InputExecutionOrder.Before,
    true
  )

  useEffect(() => {
    const authoringEntity = getAuthoringCounterpart(entity)

    setComponent(entity, ActiveHelperComponent, {
      selected: selectedEntities.find((e) => e === authoringEntity) !== undefined
    })
  }, [selectedEntities])

  useEffect(() => {
    const setGizmoVisibility = (visible: boolean) => {
      if (getComponent(entity, ActiveHelperComponent).helperIconGizmo === UndefinedEntity) return

      setVisibleComponent(getComponent(entity, ActiveHelperComponent).helperIconGizmo, visible)
      getComponent(entity, ActiveHelperComponent).directionalEntities.forEach((entity) => {
        setVisibleComponent(entity, visible)
      })
      getComponent(entity, ActiveHelperComponent).lineEntities.forEach((entity) => {
        setVisibleComponent(entity, visible)
      })
    }

    setGizmoVisibility(
      engineState.isEditing.value && editorHelperState.gizmoEnabled.value && activeHelperComponent.enabled.value
    )
  }, [engineState.isEditing, editorHelperState.gizmoEnabled, activeHelperComponent.enabled])
  return null
}

const reactor = () => {
  useEffect(() => {
    InputHeuristicState.addHeuristic(1, studioIconGizmoInputHeuristic as HeuristicFunctions)
  }, [])

  return (
    <QueryReactor
      Components={[ActiveHelperComponent, SimulationLayerComponent]}
      ChildEntityReactor={ActiveHelperReactor}
    />
  )
}

export const ActiveHelperSystem = defineSystem({
  uuid: 'ee.engine.ActiveHelperSystem',
  insert: { before: PresentationSystemGroup },
  execute: () => {},
  reactor
})
