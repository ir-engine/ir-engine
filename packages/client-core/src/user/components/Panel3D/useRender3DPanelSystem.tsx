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

import React, { useEffect } from 'react'

import { createEntity, getComponent, setComponent } from '@etherealengine/ecs'
import { useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { SceneComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import {
  EntityTreeComponent,
  removeEntityNodeRecursively
} from '@etherealengine/spatial/src/transform/components/EntityTree'

export function useRender3DPanelSystem(canvas: React.MutableRefObject<HTMLCanvasElement>) {
  const panelState = useHookstate(() => ({
    cameraEntity: createEntity(),
    sceneEntity: createEntity()
  }))

  useEffect(() => {
    const { cameraEntity, sceneEntity } = panelState.value
    return () => {
      // cleanup entities and state associated with this 3d panel
      removeEntityNodeRecursively(cameraEntity)
      removeEntityNodeRecursively(sceneEntity)
    }
  }, [])

  useEffect(() => {
    if (!canvas.current) return

    const { cameraEntity, sceneEntity } = panelState.value
    setComponent(sceneEntity, SceneComponent)
    setComponent(sceneEntity, TransformComponent)
    setComponent(sceneEntity, EntityTreeComponent)
    setComponent(cameraEntity, CameraComponent)
    setComponent(cameraEntity, TransformComponent)
    setComponent(cameraEntity, VisibleComponent)
    setComponent(cameraEntity, NameComponent, '3D Preview Camera for ' + canvas.current.id)
    setComponent(cameraEntity, CameraOrbitComponent, { refocus: true })
    setComponent(cameraEntity, RendererComponent, { canvas: canvas.current, scenes: [sceneEntity] })
    getComponent(cameraEntity, RendererComponent).initialize()
    setComponent(cameraEntity, InputComponent)
  }, [canvas.current])

  return panelState.value
}
