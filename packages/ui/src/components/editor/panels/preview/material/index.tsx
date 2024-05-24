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

import React, { useEffect, useRef } from 'react'
import { Mesh, SphereGeometry } from 'three'

import { useRender3DPanelSystem } from '@etherealengine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import { generateEntityUUID, getComponent, getMutableComponent, setComponent, UUIDComponent } from '@etherealengine/ecs'
import { EnvmapComponent } from '@etherealengine/engine/src/scene/components/EnvmapComponent'
import { MaterialSelectionState } from '@etherealengine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { getMaterial } from '@etherealengine/spatial/src/renderer/materials/materialFunctions'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { MaterialsPanelTab } from '../../Materials'

export const MaterialPreviewCanvas = () => {
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const renderPanel = useRender3DPanelSystem(panelRef)
  const selectedMaterial = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial)
  const panel = document.getElementById(MaterialsPanelTab.id!)

  useEffect(() => {
    if (!selectedMaterial.value) return
    const { sceneEntity, cameraEntity } = renderPanel
    setComponent(sceneEntity, NameComponent, 'Material Preview Entity')
    const uuid = generateEntityUUID()
    setComponent(sceneEntity, UUIDComponent, uuid)
    setComponent(sceneEntity, VisibleComponent, true)
    const material = getMaterial(getState(MaterialSelectionState).selectedMaterial!)
    if (!material) return
    addObjectToGroup(sceneEntity, new Mesh(new SphereGeometry(5, 32, 32), material))
    setComponent(sceneEntity, EnvmapComponent, { type: 'Skybox', envMapIntensity: 2 })
    const orbitCamera = getMutableComponent(cameraEntity, CameraOrbitComponent)
    orbitCamera.focusedEntities.set([sceneEntity])
    orbitCamera.refocus.set(true)
  }, [selectedMaterial])

  useEffect(() => {
    if (!panelRef?.current) return
    if (!panel) return
    getComponent(renderPanel.cameraEntity, RendererComponent).needsResize = true

    const observer = new ResizeObserver(() => {
      getComponent(renderPanel.cameraEntity, RendererComponent).needsResize = true
    })

    observer.observe(panel)

    return () => {
      observer.disconnect()
    }
  }, [panelRef])

  return (
    <>
      <div id="materialPreview" className="aspect-square h-full min-h-[100px] w-full">
        <canvas ref={panelRef} className="pointer-events-auto" />
      </div>
    </>
  )
}

export const MaterialPreviewPanel = (props) => {
  const selectedMaterial = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial)
  if (!selectedMaterial.value) return null
  return <MaterialPreviewCanvas key={selectedMaterial.value} />
}
