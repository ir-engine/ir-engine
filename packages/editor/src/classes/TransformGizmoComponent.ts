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
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { TransformControls } from '@etherealengine/engine/src/scene/classes/TransformGizmo'

import { Engine } from '@etherealengine/ecs/src/Engine'
import { SnapMode, TransformPivot } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { EngineRenderer } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { useEffect } from 'react'
import { Euler, Object3D } from 'three'
import { degToRad } from 'three/src/math/MathUtils'
import { EditorControlFunctions } from '../functions/EditorControlFunctions'
import { EditorHelperState } from '../services/EditorHelperState'
import { ObjectGridSnapState } from '../systems/ObjectGridSnapSystem'

export const TransformGizmoComponent = defineComponent({
  name: 'TransformGizmo',

  onInit(entity) {
    const control = new TransformControls(
      getComponent(Engine.instance.cameraEntity, CameraComponent),
      EngineRenderer.instance.renderer.domElement
    )
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

    useEffect(() => {
      // create dummy object to attach gizmo to, we can only attach to three js objects
      gizmoComponent.value.addEventListener('mouseUp', (event) => {
        EditorControlFunctions.positionObject([entity], [transformComponent.value.position])
        EditorControlFunctions.rotateObject(
          [entity],
          [new Euler().setFromQuaternion(transformComponent.value.rotation)]
        )
        EditorControlFunctions.scaleObject([entity], [transformComponent.value.scale], true)
        //check for snap modes
        if (!getState(ObjectGridSnapState).enabled) {
          EditorControlFunctions.commitTransformSave([entity])
        } else {
          getMutableState(ObjectGridSnapState).apply.set(true)
        }
      })

      const dummy = new Object3D()
      dummy.name = 'gizmoProxy'
      // create dummy Entity for gizmo helper
      const dummyEntity = createEntity()
      setComponent(dummyEntity, NameComponent, 'gizmoEntity')
      setComponent(dummyEntity, VisibleComponent)

      // set layers
      const raycaster = gizmoComponent.value.getRaycaster()
      raycaster.layers.set(ObjectLayers.TransformGizmo)

      // add dummy to entity and gizmo to dummy entity and attach
      addObjectToGroup(entity, dummy)
      gizmoComponent.value.attach(dummy)
      addObjectToGroup(dummyEntity, gizmoComponent.value)
      setObjectLayers(gizmoComponent.value, ObjectLayers.TransformGizmo)
      setObjectLayers(dummy, ObjectLayers.TransformGizmo)
      removeComponent(dummyEntity, TransformComponent)

      return () => {
        removeObjectFromGroup(entity, dummy)
        removeEntity(dummyEntity)
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
      //TODO: implement gizmo attachment for multiple entities selected
      switch (editorHelperState.transformPivot.value) {
        case TransformPivot.Selection:
          break
        case TransformPivot.Center:
          break
        case TransformPivot.Bottom:
          break
        case TransformPivot.Origin:
          break
      }
    }, [editorHelperState.transformPivot])

    useEffect(() => {
      const space = editorHelperState.transformSpace.value
      gizmoComponent.value.setSpace(space)
    }, [editorHelperState.transformSpace])

    useEffect(() => {
      switch (editorHelperState.gridSnap.value) {
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
    }, [editorHelperState.gridSnap])

    useEffect(() => {
      gizmoComponent.value.setTranslationSnap(
        editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.translationSnap.value : null
      )
    }, [editorHelperState.translationSnap])

    useEffect(() => {
      gizmoComponent.value.setRotationSnap(
        editorHelperState.gridSnap.value === SnapMode.Grid ? degToRad(editorHelperState.rotationSnap.value) : null
      )
    }, [editorHelperState.rotationSnap])

    useEffect(() => {
      gizmoComponent.value.setScaleSnap(
        editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.scaleSnap.value : null
      )
    }, [editorHelperState.scaleSnap])

    return null
  }
})
