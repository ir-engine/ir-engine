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
  getAuthoringCounterpart,
  getComponent,
  removeComponent,
  setComponent,
  useEntityContext,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, NO_PROXY_STEALTH, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { useHelperEntity } from '@ir-engine/spatial/src/helper/functions/useHelperEntity'
import React from 'react'

import { QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { InputComponent, InputExecutionOrder } from '@ir-engine/spatial/src/input/components/InputComponent'
import {
  HeuristicFunctions,
  InputHeuristicState,
  IntersectionData
} from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks, ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import { Raycaster, Vector3 } from 'three'
import { TransformGizmoControlComponent } from '../classes/gizmo/transform/TransformGizmoControlComponent'
import { ComponentHelperState } from '../classes/helper/ComponentHelperState'
import { iconGizmoArrow, iconGizmoYHelper, setupGizmo } from '../constants/GizmoPresets'
import {
  getIconGizmo,
  gizmoIconHelperYAxisUpdate,
  gizmoIconUpdate,
  setIconSize,
  VolumeVisibility
} from '../functions/gizmos/studioIconGizmoHelper'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'
import { transformGizmoControllerQuery } from './TransformGizmoSystem'

const _raycaster = new Raycaster() // for heuristic
_raycaster.layers.enable(ObjectLayers.NodeIcon) // only icons
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

const ActiveHelperReactor = (helper) => {
  const entity = useEntityContext()
  const editorHelperState = useHookstate(getMutableState(EditorHelperState))
  const engineState = useHookstate(getMutableState(EngineState))
  const selectedEntities = SelectionState.useSelectedEntities() // all authoring layer
  const selected = useHookstate<boolean>(false)
  const lineEntitiesState = useHookstate<Entity[]>([])
  const directionalEntitiesState = useHookstate<Entity[]>([])
  const iconSize = useHookstate<number>(getState(EditorHelperState).editorIconMinSize)
  const visibility = useHasComponent(entity, VisibleComponent)
  const studioIconEntity = useHelperEntity(
    entity,
    () => {
      const iconGizmo = getIconGizmo(helper.icon)
      iconGizmo.renderOrder = -1

      if (helper?.directional) {
        const directionalEntities = setupGizmo(entity, iconGizmoArrow, ObjectLayers.NodeIcon)
        directionalEntitiesState.set(directionalEntities)
      }

      if (helper?.volume) {
        setComponent(entity, BoundingBoxComponent)
      }

      const lineEntities = setupGizmo(
        getState(ReferenceSpaceState).originEntity,
        iconGizmoYHelper,
        ObjectLayers.NodeIcon
      )
      lineEntitiesState.set(lineEntities)
      return iconGizmo
    },
    editorHelperState.gizmoEnabled.value && visibility && engineState.isEditing.value && helper?.icon !== undefined,
    ObjectLayerMasks.NodeIcon,
    'icon-helper'
  )
  const hovered = InputComponent.useHasFocus(studioIconEntity)

  InputComponent.useExecuteWithInput(
    () => {
      if (studioIconEntity === UndefinedEntity) return
      if (!engineState.isEditing.value || !editorHelperState.gizmoEnabled.value) return

      gizmoIconUpdate(entity, studioIconEntity, [...directionalEntitiesState.get(NO_PROXY_STEALTH)], iconSize.value)

      iconSize.set((currentSize) => setIconSize(hovered.value, currentSize))

      for (const lineEntity of lineEntitiesState.value) {
        setVisibleComponent(lineEntity, hovered.value && getState(EngineState).isEditing ? true : false)
        gizmoIconHelperYAxisUpdate(lineEntity, getComponent(entity, TransformComponent).position)
      }

      const transformGizmoControllerEntity = transformGizmoControllerQuery()
      if (selected.value)
        if (
          transformGizmoControllerEntity.length > 0 &&
          getComponent(transformGizmoControllerEntity[0], TransformGizmoControlComponent).dragging
        )
          return

      const defaultGizmoButtons = InputComponent.getButtons(studioIconEntity)

      if (defaultGizmoButtons.PrimaryClick?.down) {
        SelectionState.updateSelection([UUIDComponent.get(entity)])
      }
    },
    InputExecutionOrder.Before,
    true
  )

  useEffect(() => {
    if (helper?.volume === undefined) return
    switch (editorHelperState.volumeVisibility.value) {
      case VolumeVisibility.On:
        setComponent(entity, BoundingBoxComponent)
        break
      case VolumeVisibility.Off:
        return
      case VolumeVisibility.Auto:
        console.log('Auto volume visibility for', entity, 'selected:', selected.value, 'hovered:', hovered.value)
        if (selected.value || hovered.value) {
          setComponent(entity, BoundingBoxComponent)
        } else {
          return
        }
        break
    }
    return () => {
      removeComponent(entity, BoundingBoxComponent)
    }
  }, [selected, hovered, helper?.volume, visibility, editorHelperState.volumeVisibility])

  useEffect(() => {
    const authoringEntity = getAuthoringCounterpart(entity)
    selected.set(selectedEntities.find((e) => e === authoringEntity) !== undefined)
  }, [selectedEntities])

  useEffect(() => {
    const setGizmoVisibility = (visible: boolean) => {
      if (studioIconEntity === UndefinedEntity) return
      setVisibleComponent(studioIconEntity, visible)
      directionalEntitiesState.value.forEach((entity) => {
        setVisibleComponent(entity, visible)
      })
      lineEntitiesState.value.forEach((entity) => {
        setVisibleComponent(entity, visible)
      })
    }
    setGizmoVisibility(engineState.isEditing.value && editorHelperState.gizmoEnabled.value)
  }, [engineState.isEditing, editorHelperState.gizmoEnabled])

  return (
    <helper.reactor
      parentEntity={entity}
      iconEntity={studioIconEntity}
      selected={selected.value}
      hovered={hovered.value}
    />
  )
}

const reactor = () => {
  useEffect(() => {
    InputHeuristicState.addHeuristic(1, studioIconGizmoInputHeuristic as HeuristicFunctions)
  }, [])

  // use registry to add helper reactors
  const HelperRegistry = useMutableState(ComponentHelperState).keys

  console.log('DEBUG ActiveHelperSystem reactor with HelperRegistry = ', HelperRegistry)
  return (
    <>
      {HelperRegistry.map((componentJsonId) => {
        const component = globalThis.ComponentJSONIDMap.get(componentJsonId)
        if (!component) return null
        const helper = getState(ComponentHelperState)[componentJsonId]
        if (!helper || !helper.reactor) return null
        return <QueryReactor Components={[component]} ChildEntityReactor={ActiveHelperReactor} props={helper} />
      })}
    </>
  )
}

export const ActiveHelperSystem = defineSystem({
  uuid: 'ee.engine.ActiveHelperSystem',
  insert: { with: PresentationSystemGroup },
  execute: () => {},
  reactor
})
