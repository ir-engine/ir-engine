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
  defineComponent,
  getComponent,
  setComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { TransformControls } from '@etherealengine/engine/src/scene/classes/TransformGizmo'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import {
  SnapMode,
  TransformMode,
  TransformPivot,
  TransformSpace
} from '@etherealengine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { Box3, Euler, Vector3 } from 'three'
import { degToRad } from 'three/src/math/MathUtils'
import { EditorControlFunctions } from '../functions/EditorControlFunctions'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'

export const TransformGizmoComponent = defineComponent({
  name: 'TransformEcsGizmo',

  onInit(entity) {
    const control = new TransformControls()
    return control
  },
  onRemove: (entity, component) => {
    component.value.detach()
    component.value.dispose()
  },
  reactor: function (props) {
    const entity = useEntityContext()
    const gizmoComponent = useComponent(entity, TransformGizmoComponent)
    const editorHelperState = useHookstate(getMutableState(EditorHelperState))

    const transformComponent = useComponent(entity, TransformComponent)
    const selectionState = useHookstate(getMutableState(SelectionState))
    //const gizmoDummy = new Object3D()
    //gizmoDummy.name = 'gizmoProxy'
    const gizmoEntity = createEntity()

    const box = new Box3()

    useEffect(() => {
      // create dummy object to attach gizmo to, we can only attach to three js objects

      gizmoComponent.value.addEventListener('mouseUp', (event) => {
        if (selectionState.selectedEntities.value.length <= 1) {
          switch (gizmoComponent.value.mode) {
            case TransformMode.translate:
              EditorControlFunctions.positionObject([entity], [transformComponent.value.position])
              break
            case TransformMode.rotate:
              EditorControlFunctions.rotateObject(
                [entity],
                [new Euler().setFromQuaternion(transformComponent.value.rotation)]
              )
              break
            case TransformMode.scale:
              EditorControlFunctions.scaleObject([entity], [transformComponent.value.scale], TransformSpace.local, true)
              break
          }

          EditorControlFunctions.commitTransformSave([entity])
        } else {
          const entities = selectionState.selectedEntities.value
          const translationVector = transformComponent.value.position.sub(gizmoComponent.value.worldPositionStart)

          switch (gizmoComponent.value.mode) {
            case TransformMode.translate:
              EditorControlFunctions.positionObject(entities, [translationVector], gizmoComponent.value.space, true)
              break
            case TransformMode.rotate:
              console.log(entities, transformComponent.value.position)
              EditorControlFunctions.rotateAround(
                entities,
                gizmoComponent.value.rotationAxis,
                gizmoComponent.value.rotationAngle,
                gizmoComponent.value.worldPosition // pivot position
              )
              break
            case TransformMode.scale:
              EditorControlFunctions.scaleObject(entities, [transformComponent.value.scale], TransformSpace.local, true)
              break
          }

          EditorControlFunctions.commitTransformSave(entities)
        }
      })

      // create dummy Entity for gizmo helper
      setComponent(gizmoEntity, NameComponent, 'gizmoEntity')
      setComponent(gizmoEntity, VisibleComponent)
      addObjectToGroup(gizmoEntity, gizmoComponent.value) // adding object calls attach internally on the gizmo, so attch entity last

      gizmoComponent.value.attach(entity)

      return () => {
        //removeObjectFromGroup(entity, gizmoDummy)
        removeEntity(gizmoEntity)
      }
    }, [])

    useEffect(() => {
      const mode = editorHelperState.transformMode.value
      gizmoComponent.value.setMode(mode)
    }, [editorHelperState.transformMode])

    useEffect(() => {
      const mode = editorHelperState.transformMode.value
      gizmoComponent.value.setMode(mode)
    }, [editorHelperState.transformMode])

    useEffect(() => {
      if (selectionState.selectedEntities.value.length < 1) return
      let newPosition = getComponent(entity, TransformComponent).position
      const selectedEntities = selectionState.selectedEntities.value
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

      setComponent(entity, TransformComponent, { position: newPosition })
    }, [editorHelperState.transformPivot, selectionState.selectedEntities])

    useEffect(() => {
      const space = editorHelperState.transformSpace.value
      gizmoComponent.value.setSpace(space)
    }, [editorHelperState.transformSpace])

    useEffect(() => {
      switch (editorHelperState.snapMode.value) {
        case SnapMode.Disabled: // continous update
          gizmoComponent.value.setTranslationSnap(null)
          gizmoComponent.value.setRotationSnap(null)
          gizmoComponent.value.setScaleSnap(null)
          break
        case SnapMode.Grid:
          gizmoComponent.value.setTranslationSnap(editorHelperState.translationSnap.value)
          gizmoComponent.value.setRotationSnap(degToRad(editorHelperState.rotationSnap.value))
          gizmoComponent.value.setScaleSnap(editorHelperState.scaleSnap.value)
          break
      }
    }, [editorHelperState.snapMode])

    useEffect(() => {
      gizmoComponent.value.setTranslationSnap(editorHelperState.translationSnap.value)
    }, [editorHelperState.translationSnap])

    useEffect(() => {
      gizmoComponent.value.setRotationSnap(degToRad(editorHelperState.rotationSnap.value))
    }, [editorHelperState.rotationSnap])

    useEffect(() => {
      gizmoComponent.value.setScaleSnap(editorHelperState.scaleSnap.value)
    }, [editorHelperState.scaleSnap])

    return null
  }
})
