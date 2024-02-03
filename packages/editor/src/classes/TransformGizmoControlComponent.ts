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

import {
  Engine,
  PresentationSystemGroup,
  UndefinedEntity,
  defineComponent,
  defineQuery,
  getComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useExecute
} from '@etherealengine/ecs'
import { TransformControlsGizmo, TransformControlsPlane } from '@etherealengine/engine/src/scene/classes/TransformGizmo'
import { SceneObjectComponent } from '@etherealengine/engine/src/scene/components/SceneObjectComponent'
import {
  SnapMode,
  TransformAxisType,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformSpace,
  TransformSpaceType
} from '@etherealengine/engine/src/scene/constants/transformConstants'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { matches } from '@etherealengine/spatial/src/common/functions/MatchesUtils'
import { EngineRenderer } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { useEffect } from 'react'
import { Box3, Quaternion, Vector3 } from 'three'
import { degToRad } from 'three/src/math/MathUtils'
import {
  controlUpdate,
  destroyGizmo,
  gizmoUpdate,
  initGizmo,
  onPointerDown,
  onPointerHover,
  onPointerMove,
  onPointerUp,
  planeUpdate
} from '../functions/gizmoHelper'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'

export const TransformGizmoControlComponent = defineComponent({
  name: 'TransformGizmoControl',

  onInit(entity) {
    //const control = new TransformControls()
    const control = {
      controlledEntity: UndefinedEntity,
      visualEntity: UndefinedEntity,
      planeEntity: UndefinedEntity,
      enabled: true,
      dragging: false,
      axis: null! as TransformAxisType | null,
      space: TransformSpace.world as TransformSpaceType,
      mode: TransformMode.translate as TransformModeType,
      translationSnap: null! as number,
      rotationSnap: null! as number,
      scaleSnap: null! as number,
      size: 1,
      showX: true,
      showY: true,
      showZ: true,
      worldPosition: new Vector3(),
      worldPositionStart: new Vector3(),
      worldQuaternion: new Quaternion(),
      worldQuaternionStart: new Quaternion(),
      pointStart: new Vector3(),
      pointEnd: new Vector3(),
      rotationAxis: new Vector3(),
      rotationAngle: 0,
      eye: new Vector3()
    }
    return control
  },
  onSet(entity, component, json) {
    if (!json) return

    if (matches.number.test(json.controlledEntity)) component.controlledEntity.set(json.controlledEntity)
    if (matches.number.test(json.visualEntity)) component.visualEntity.set(json.visualEntity)
    if (matches.number.test(json.planeEntity)) component.planeEntity.set(json.planeEntity)

    if (typeof json.enabled === 'boolean') component.enabled.set(json.enabled)
    if (typeof json.dragging === 'boolean') component.dragging.set(json.dragging)
    if (typeof json.axis === 'string') component.axis.set(json.axis)
    if (typeof json.space === 'string') component.space.set(json.space)
    if (typeof json.mode === 'string') component.mode.set(json.mode)
    if (typeof json.translationSnap === 'number') component.translationSnap.set(json.translationSnap)
    if (typeof json.rotationSnap === 'number') component.rotationSnap.set(json.rotationSnap)
    if (typeof json.scaleSnap === 'number') component.scaleSnap.set(json.scaleSnap)
    if (typeof json.size === 'number') component.size.set(json.size)
    if (typeof json.showX === 'number') component.showX.set(json.showX)
    if (typeof json.showY === 'number') component.showY.set(json.showY)
    if (typeof json.showZ === 'number') component.showZ.set(json.showZ)
  },
  onRemove: (entity, component) => {
    //component.value.detach()
    //component.value.dispose()
  },
  reactor: function (props) {
    const gizmoEntity = useEntityContext()
    const gizmoControlComponent = useComponent(gizmoEntity, TransformGizmoControlComponent)

    //const gizmoEntity = createEntity()
    const domElement = EngineRenderer.instance.renderer.domElement
    domElement.style.touchAction = 'none' // disable touch scroll , hmm the editor window isnt scrollable anyways
    const box = new Box3()

    //temp variables
    const editorHelperState = useHookstate(getMutableState(EditorHelperState))
    const query = defineQuery([SceneObjectComponent]) // hardcoded for now until we can make it dynamic
    const selectionState = useHookstate(getMutableState(SelectionState))

    useExecute(
      () => {
        if (gizmoControlComponent === undefined) return
        if (!gizmoControlComponent.enabled.value) return

        //_gizmo.updateMatrixWorld(true)
        gizmoUpdate(gizmoEntity)
        //_plane.updateMatrixWorld(true)
        planeUpdate(gizmoEntity)

        controlUpdate(gizmoEntity)
      },
      { with: PresentationSystemGroup }
    )

    useEffect(() => {
      const gizmo = new TransformControlsGizmo()
      const plane = new TransformControlsPlane()
      // create dummy object to attach gizmo to, we can only attach to three js objects
      domElement.addEventListener('pointerdown', (event) => {
        onPointerDown(event, gizmoEntity)
      })
      domElement.addEventListener('pointermove', (event) => {
        onPointerHover(event, gizmoEntity)
      })
      domElement.addEventListener('pointerup', (event) => {
        onPointerUp(event, gizmoEntity)
      })
      initGizmo(gizmoEntity, plane)

      return () => {
        domElement.removeEventListener('pointerdown', (event) => {
          onPointerDown(event, gizmoEntity)
        })
        domElement.removeEventListener('pointerhover', (event) => {
          onPointerHover(event, gizmoEntity)
        })
        domElement.removeEventListener('pointermove', (event) => {
          onPointerMove(event, gizmoEntity)
        })
        domElement.removeEventListener('pointerup', (event) => {
          onPointerUp(event, gizmoEntity)
        })
        destroyGizmo(gizmoEntity, plane)
      }
    }, [])

    useEffect(() => {
      const mode = editorHelperState.transformMode.value
      gizmoControlComponent.mode.set(mode)
    }, [editorHelperState.transformMode])

    useEffect(() => {
      if (selectionState.selectedEntities.value.length < 1) return
      let newPosition = getComponent(gizmoControlComponent.controlledEntity.value, TransformComponent).position
      const selectedEntities = selectionState.selectedEntities.value.filter((value) => query().includes(value))
      const selectedTransform = getComponent(selectedEntities[selectedEntities.length - 1], TransformComponent)

      switch (editorHelperState.transformPivot.value) {
        case TransformPivot.Origin:
          newPosition = new Vector3(0, 0, 0)
          break
        case TransformPivot.Selection:
          newPosition = selectedTransform.position
          break
        case TransformPivot.Center:
        case TransformPivot.Bottom:
          box.makeEmpty()

          for (let i = 0; i < selectedEntities.length; i++) {
            const parentEnt = selectedEntities[i]
            const isUuid = typeof parentEnt === 'string'
            if (isUuid) {
              box.expandByObject(Engine.instance.scene.getObjectByProperty('uuid', parentEnt)!)
            } else {
              box.expandByPoint(getComponent(parentEnt, TransformComponent).position)
            }
          }
          box.getCenter(newPosition)

          if (editorHelperState.transformPivot.value === TransformPivot.Bottom) newPosition.y = box.min.y
          break
      }

      setComponent(gizmoControlComponent.controlledEntity.value, TransformComponent, { position: newPosition })
    }, [editorHelperState.transformPivot, selectionState.selectedEntities])

    useEffect(() => {
      const space = editorHelperState.transformSpace.value
      gizmoControlComponent.space.set(space)
    }, [editorHelperState.transformSpace])

    useEffect(() => {
      switch (editorHelperState.gridSnap.value) {
        case SnapMode.Disabled: // continous update
          gizmoControlComponent.translationSnap.set(0)
          gizmoControlComponent.rotationSnap.set(0)
          gizmoControlComponent.scaleSnap.set(0)
          break
        case SnapMode.Grid:
          gizmoControlComponent.translationSnap.set(editorHelperState.translationSnap.value)
          gizmoControlComponent.rotationSnap.set(degToRad(editorHelperState.rotationSnap.value))
          gizmoControlComponent.scaleSnap.set(editorHelperState.scaleSnap.value)
          break
      }
    }, [editorHelperState.gridSnap])

    useEffect(() => {
      gizmoControlComponent.translationSnap.set(
        editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.translationSnap.value : 0
      )
    }, [editorHelperState.translationSnap])

    useEffect(() => {
      gizmoControlComponent.rotationSnap.set(
        editorHelperState.gridSnap.value === SnapMode.Grid ? degToRad(editorHelperState.rotationSnap.value) : 0
      )
    }, [editorHelperState.rotationSnap])

    useEffect(() => {
      gizmoControlComponent.scaleSnap.set(
        editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.scaleSnap.value : 0
      )
    }, [editorHelperState.scaleSnap])

    return null
  }
})
