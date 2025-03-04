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

import { defineQuery, EngineState, Entity, UndefinedEntity, useQuery, UUIDComponent } from '@ir-engine/ecs'
import {
  getAllComponents,
  getComponent,
  LayerComponents,
  Layers,
  setComponent,
  SimulationLayerComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { entityExists } from '@ir-engine/ecs/src/EntityFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { ActiveHelperComponent } from '@ir-engine/spatial/src/common/ActiveHelperComponent'
import { createHelperEntity } from '@ir-engine/spatial/src/common/debug/useHelperEntity'

import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputHeuristicState, IntersectionData } from '@ir-engine/spatial/src/input/functions/ClientInputHeuristics'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks, ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { Raycaster, Vector3 } from 'three'
import { TransformGizmoControlComponent } from '../classes/gizmo/transform/TransformGizmoControlComponent'
import { iconGizmoArrow, iconGizmoYHelper, setupGizmo } from '../constants/GizmoPresets'
import {
  createIconGizmo,
  gizmoIconHelperYAxisUpdate,
  gizmoIconUpdate,
  onPointerHover
} from '../functions/gizmos/studioIconGizmoHelper'
import { ComponentStudioIconState } from '../services/ComponentStudioIcons'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'
import { transformGizmoControllerQuery } from './TransformGizmoSystem'

const _raycaster = new Raycaster()
_raycaster.layers.enable(ObjectLayers.NodeHelper)
_raycaster.firstHitOnly = true

const inputObjectsQuery = defineQuery([InputComponent, VisibleComponent, ObjectComponent])

export function studioIconGizmoInputHeuristic(
  intersectionData: Set<IntersectionData>,
  position: Vector3,
  direction: Vector3
) {
  const isEditing = getState(EngineState).isEditing
  if (!isEditing) return

  const gizmoEnabled = getState(EditorHelperState).gizmoEnabled
  if (!gizmoEnabled) return

  _raycaster.set(position, direction)
  _raycaster.camera = getComponent(getState(ReferenceSpaceState).viewerEntity, CameraComponent).cameras[0]

  const objects = inputObjectsQuery().map((eid) => getComponent(eid, ObjectComponent))

  const hits = _raycaster.intersectObjects(objects, true)
  for (const hit of hits) {
    intersectionData.add({ entity: hit.object.entity!, distance: hit.distance })
  }
}

const helperQuery = defineQuery([ActiveHelperComponent])

const execute = () => {
  for (const entity of helperQuery()) {
    const activeHelperComponent = getComponent(entity, ActiveHelperComponent)

    if (!activeHelperComponent.helperDefaultGizmo) continue

    gizmoIconUpdate(entity)

    const intersect = onPointerHover(entity)
    for (const lineEntity of activeHelperComponent.lineEntities) {
      setVisibleComponent(lineEntity, intersect ? true : false)
      gizmoIconHelperYAxisUpdate(lineEntity, getComponent(entity, TransformComponent).position)
    }

    const transformGizmoControllerEntity = transformGizmoControllerQuery()
    const selectedEntities = SelectionState.getSelectedEntities()
    if (!(selectedEntities.find((e) => e === entity) === undefined)) continue

    if (
      transformGizmoControllerEntity.length > 0 &&
      getComponent(transformGizmoControllerEntity[0], TransformGizmoControlComponent).dragging
    )
      continue

    const defaultGizmoButtons = InputComponent.getMergedButtons(activeHelperComponent.helperDefaultGizmo)

    if (defaultGizmoButtons.PrimaryClick?.down) {
      SelectionState.updateSelection([getComponent(entity, UUIDComponent)])
    }
  }
}

const useStudioIconGizmo = () => {
  const componentStudioIconState = useHookstate(getMutableState(ComponentStudioIconState))
  const helperQuery = useQuery([ActiveHelperComponent, SimulationLayerComponent])

  useEffect(() => {
    for (const entity of helperQuery) {
      if (getComponent(entity, ActiveHelperComponent).helperDefaultGizmo !== UndefinedEntity) continue
      const componentStudioIcon = componentStudioIconState.get(NO_PROXY)
      const entityComponents = getAllComponents(entity)
      const targetComponent: any = entityComponents.find((component) =>
        Object.keys(componentStudioIcon).find((key) => key === component.name)
      )
      const iconHelper = createHelperEntity(
        entity,
        () => {
          const iconGizmo = createIconGizmo(componentStudioIcon[targetComponent?.name])
          iconGizmo.renderOrder = -1
          const lineEntitites = setupGizmo(
            getState(ReferenceSpaceState).originEntity,
            iconGizmoYHelper,
            ObjectLayers.NodeHelper
          )
          setComponent(entity, ActiveHelperComponent, { lineEntities: lineEntitites })
          if (getComponent(entity, ActiveHelperComponent).directional) {
            const directionalEntity = setupGizmo(entity, iconGizmoArrow, ObjectLayers.NodeHelper)
            setComponent(entity, ActiveHelperComponent, { directionalEntities: directionalEntity })
          }
          return iconGizmo
        },
        ObjectLayerMasks.NodeHelper,
        'icon-helper'
      )
      setComponent(entity, ActiveHelperComponent, { helperDefaultGizmo: iconHelper })
      // create the icon helper
    }
  }, [helperQuery])
}

const useActiveHelper = (entities) => {
  const refs = LayerComponents[Layers.Simulation].refs
  const simulationEntities = Object.keys(refs).filter((key) => entities.includes(refs[key])) as unknown as Entity[]
  useEffect(() => {
    for (const entity of simulationEntities) {
      if (!entityExists(entity)) continue
      setComponent(entity, ActiveHelperComponent, { enabled: true })
    }
    return () => {
      for (const entity of simulationEntities) {
        if (!entityExists(entity)) continue
        setComponent(entity, ActiveHelperComponent, { enabled: false })
      }
    }
  }, [entities])
}

const reactor = () => {
  useEffect(() => {
    getMutableState(InputHeuristicState).merge([
      {
        order: 1,
        heuristic: studioIconGizmoInputHeuristic
      }
    ])
  }, [])

  const selectedEntities = SelectionState.useSelectedEntities() // all authoring layer

  useStudioIconGizmo()
  useActiveHelper(selectedEntities)
  return null
}

export const ActiveHelperSystem = defineSystem({
  uuid: 'ee.engine.ActiveHelperSystem',
  insert: { before: PresentationSystemGroup },
  execute,
  reactor
})
