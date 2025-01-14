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

import { useRender3DPanelSystem } from '@ir-engine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import {
  createEntity,
  EntityTreeComponent,
  generateEntityUUID,
  removeComponent,
  setComponent,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { AmbientLightComponent, TransformComponent } from '@ir-engine/spatial'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import React, { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { CameraGizmoComponent } from '../../../classes/gizmo/camera/CameraGizmoComponent'

export default function CameraGizmoTool({
  viewportRef,
  toolbarRef
}: {
  viewportRef: React.RefObject<HTMLDivElement>
  toolbarRef: React.RefObject<HTMLDivElement>
}) {
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const cameraGizmoRenderPanel = useRender3DPanelSystem(panelRef)

  useEffect(() => {
    const { sceneEntity, cameraEntity } = cameraGizmoRenderPanel

    const uuid = generateEntityUUID()

    setComponent(sceneEntity, UUIDComponent, uuid)
    setComponent(sceneEntity, NameComponent, 'Camera Gizmo Scene')
    setComponent(sceneEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    setComponent(sceneEntity, VisibleComponent, true)
    setComponent(sceneEntity, CameraGizmoComponent, { sceneEntity: sceneEntity, cameraEntity: cameraEntity })
    removeComponent(cameraEntity, CameraOrbitComponent)
    setComponent(cameraEntity, TransformComponent, { position: new Vector3(0, 0, 2) })

    const lightEntity = createEntity()
    setComponent(lightEntity, AmbientLightComponent)
    setComponent(lightEntity, TransformComponent)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, NameComponent, 'Ambient Light')
    setComponent(lightEntity, EntityTreeComponent, { parentEntity: sceneEntity })
  }, [])

  return (
    <div className="z-[4] ml-auto h-20 w-20 ">
      <canvas ref={panelRef} style={{ pointerEvents: 'all' }} />
    </div>
  )
}
