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
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'

import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { useExecute } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { setObjectLayers } from '@etherealengine/engine/src/scene/functions/setObjectLayers'
import { LocalTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { Object3D } from 'three'
import { EditorHelperState } from '../services/EditorHelperState'
//import { setDragging } from '../systems/EditorControlSystem'

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

    useExecute(
      // transfer editor control system logic
      () => {
        gizmoComponent.value.updateMatrixWorld()
      },
      { with: PresentationSystemGroup }
    )

    useEffect(() => {
      // create dummy object to attach gizmo to
      const dummy = new Object3D()
      dummy.name = 'gizmoProxy'
      const localTransform = getComponent(entity, LocalTransformComponent)
      removeComponent(entity, LocalTransformComponent) /// band aid fix until we can make gizmo handle local transform

      // create dummy Entity for gizmo helper
      const dummyEntity = createEntity()
      setComponent(dummyEntity, NameComponent, 'gizmoEntity')
      setComponent(dummyEntity, VisibleComponent)
      // set layers
      const raycaster = gizmoComponent.value.getRaycaster()
      raycaster.layers.set(ObjectLayers.TransformGizmo)
      setObjectLayers(dummy, ObjectLayers.TransformGizmo)
      setObjectLayers(gizmoComponent.value, ObjectLayers.TransformGizmo)

      // add dummy to entity and gizmo to dummy entity and attach
      addObjectToGroup(entity, dummy)
      gizmoComponent.value.attach(dummy)
      addObjectToGroup(dummyEntity, gizmoComponent.value)

      return () => {
        removeObjectFromGroup(entity, dummy)
        removeEntity(dummyEntity)
        if (localTransform) setComponent(entity, LocalTransformComponent, localTransform) // add it back in
      }
    }, [])

    useEffect(() => {
      const mode = editorHelperState.transformMode.value
      gizmoComponent.value.setMode(mode)
    }, [editorHelperState.transformMode])

    useEffect(() => {}, [editorHelperState.transformPivot])

    useEffect(() => {
      const space = editorHelperState.transformSpace.value
      gizmoComponent.value.setSpace(space)
    }, [editorHelperState.transformSpace])
    return null
  }
})
