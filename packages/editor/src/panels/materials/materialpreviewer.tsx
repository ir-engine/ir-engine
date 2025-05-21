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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useCallback, useEffect, useRef } from 'react'
import { BufferAttribute, Mesh, SphereGeometry } from 'three'

import { useRender3DPanelSystem } from '@ir-engine/client-core/src/hooks/useRender3DPanelSystem'
import { EntityID, getComponent, Layers, setComponent, SourceID, UUIDComponent } from '@ir-engine/ecs'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { computeTransformPivot } from '@ir-engine/spatial/src/common/functions/TransformPivot'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { MaterialInstanceComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { SelectionState } from '../../services/SelectionServices'
import { MATERIALS_PANEL_ID } from './helpers'

function MaterialPreviewCanvas() {
  const panelRef = useRef() as React.MutableRefObject<HTMLCanvasElement>
  const renderPanel = useRender3DPanelSystem(panelRef)
  const selectedMaterial = useHookstate(getMutableState(SelectionState).selectedEntities[0])
  const panel = document.getElementById(MATERIALS_PANEL_ID)
  useEffect(() => {
    const { sceneEntity, cameraEntity } = renderPanel
    if (
      !selectedMaterial.value
      // || selectedMaterial.value === getOptionalComponent(sceneEntity, MaterialInstanceComponent)?.uuid[0]
    )
      return

    setComponent(sceneEntity, TransformComponent)
    setComponent(sceneEntity, UUIDComponent, {
      entitySourceID: 'preview' as SourceID,
      entityID: 'material' as EntityID
    })
    setComponent(sceneEntity, NameComponent, 'Material Preview Entity')
    setComponent(sceneEntity, VisibleComponent, true)
    const sphereMesh = new Mesh(new SphereGeometry(5, 32, 32))
    sphereMesh.geometry.attributes['color'] = new BufferAttribute(
      new Float32Array(sphereMesh.geometry.attributes.position.count * 3).fill(1),
      3
    )
    sphereMesh.geometry.attributes['uv1'] = sphereMesh.geometry.attributes['uv']
    setComponent(sceneEntity, MeshComponent, sphereMesh)
    const selectedMaterialEntity = UUIDComponent.getEntityByUUID(selectedMaterial.value, Layers.Authoring)
    setComponent(sceneEntity, MaterialInstanceComponent, {
      entities: [getComponent(selectedMaterialEntity, UUIDComponent).entityID]
    })

    const pivot = computeTransformPivot([sceneEntity])
    if (pivot.position) {
      CameraOrbitComponent.setFocus(cameraEntity, pivot.position, pivot.bounds)
    }

    return () => {}
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
      <div id="materialPreview" className="aspect-square h-full max-h-[200px] min-h-[100px] w-full">
        <canvas id="material-preview-canvas" ref={panelRef} className="pointer-events-auto" />
      </div>
    </>
  )
}

export const MaterialPreviewer = () => {
  const selectedMaterial = useHookstate(getMutableState(SelectionState).selectedEntities[0])
  const panel = document.getElementById(MATERIALS_PANEL_ID)!
  const disableScroll = (event: Event) => {
    event.stopPropagation()
    event.preventDefault()
  }

  const captureMouse = useCallback(() => {
    if (panel) {
      panel.addEventListener('wheel', disableScroll, { passive: false })
      panel.addEventListener('touchmove', disableScroll, { passive: false })
    }
  }, [panel, disableScroll])

  const releaseMouse = useCallback(() => {
    if (panel) {
      panel.removeEventListener('wheel', disableScroll)
      panel.removeEventListener('touchmove', disableScroll)
    }
  }, [panel, disableScroll])

  if (!selectedMaterial.value) return null

  return (
    <div className="rounded-lg bg-zinc-800 p-2" onMouseEnter={captureMouse} onMouseLeave={releaseMouse}>
      <MaterialPreviewCanvas />
    </div>
  )
}
