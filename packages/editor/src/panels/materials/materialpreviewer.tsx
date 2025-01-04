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

import React, { useEffect, useRef } from 'react'
import { BufferAttribute, Mesh, SphereGeometry } from 'three'

import { useRender3DPanelSystem } from '@ir-engine/client-core/src/user/components/Panel3D/useRender3DPanelSystem'
import {
  generateEntityUUID,
  getComponent,
  getMutableComponent,
  setComponent,
  useOptionalComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { EnvmapComponent } from '@ir-engine/engine/src/scene/components/EnvmapComponent'
import { MaterialSelectionState } from '@ir-engine/engine/src/scene/materials/MaterialLibraryState'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { getMaterial } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { MATERIALS_PANEL_ID } from './helpers'

function MaterialPreviewCanvas() {
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const renderPanel = useRender3DPanelSystem(panelRef)
  const selectedMaterial = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial)
  const panel = document.getElementById(MATERIALS_PANEL_ID)
  const materialComponent = useOptionalComponent(
    UUIDComponent.getEntityByUUID(selectedMaterial.value!),
    MaterialStateComponent
  )

  useEffect(() => {
    if (!selectedMaterial.value) return
    const { sceneEntity, cameraEntity } = renderPanel
    setComponent(sceneEntity, NameComponent, 'Material Preview Entity')
    const uuid = generateEntityUUID()
    setComponent(sceneEntity, UUIDComponent, uuid)
    setComponent(sceneEntity, VisibleComponent, true)
    const material = getMaterial(getState(MaterialSelectionState).selectedMaterial!)
    if (!material) return
    const sphereMesh = new Mesh(new SphereGeometry(5, 32, 32), material)
    sphereMesh.geometry.attributes['color'] = new BufferAttribute(
      new Float32Array(sphereMesh.geometry.attributes.position.count * 3).fill(1),
      3
    )
    sphereMesh.geometry.attributes['uv1'] = sphereMesh.geometry.attributes['uv']
    setComponent(sceneEntity, MeshComponent, sphereMesh)
    setComponent(sceneEntity, EnvmapComponent, { type: 'Skybox', envMapIntensity: 2 })
    const orbitCamera = getMutableComponent(cameraEntity, CameraOrbitComponent)
    orbitCamera.focusedEntities.set([sceneEntity])
    orbitCamera.refocus.set(true)
  }, [selectedMaterial, materialComponent?.material])

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
      <div id="materialPreview" className="aspect-square h-full max-h-[200px] min-h-[100px] w-full">
        <canvas ref={panelRef} className="pointer-events-auto" />
      </div>
    </>
  )
}

export const MaterialPreviewer = () => {
  const selectedMaterial = useHookstate(getMutableState(MaterialSelectionState).selectedMaterial)
  if (!selectedMaterial.value) return null
  return (
    <div className="rounded-lg bg-zinc-800 p-2">
      <MaterialPreviewCanvas />
    </div>
  )
}
