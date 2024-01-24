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
import { Color, DirectionalLight, Euler, Quaternion, Vector3, WebGLRenderer } from 'three'

import { useHookstateFromFactory } from '@etherealengine/common/src/utils/useHookstateFromFactory'
import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/engine/src/camera/components/CameraOrbitComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  getComponent,
  getOptionalComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { defineQuery } from '@etherealengine/engine/src/ecs/functions/QueryFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/SystemGroups'
import { InputSourceComponent } from '@etherealengine/engine/src/input/components/InputSourceComponent'
import { addClientInputListeners } from '@etherealengine/engine/src/input/systems/ClientInputSystem'
import { DirectionalLightComponent } from '@etherealengine/engine/src/scene/components/DirectionalLightComponent'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { ObjectLayerMaskComponent } from '@etherealengine/engine/src/scene/components/ObjectLayerComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { enableObjectLayer } from '@etherealengine/engine/src/scene/functions/setObjectLayers'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

export const PreviewPanelRendererState = defineState({
  name: 'previewPanelRendererState',
  initial: () => ({
    renderers: {} as Record<string, WebGLRenderer>,
    entities: {} as Record<string, Entity[]>,
    ids: [] as string[]
  })
})

const initialize3D = () => {
  const createLight = (rotation: Euler, intensity: number) => {
    const light = createEntity()
    ObjectLayerMaskComponent.setLayer(light, ObjectLayers.AssetPreview)
    setComponent(light, TransformComponent, { rotation: new Quaternion().setFromEuler(rotation) })
    setComponent(light, DirectionalLightComponent, {
      light: new DirectionalLight(),
      intensity,
      color: new Color(1, 1, 1)
    })
    setComponent(light, VisibleComponent, true)
    setComponent(light, NameComponent, '3D Preview Light 2')
    return light
  }
  const backLight = createLight(new Euler(-0.5, 0, 0), 2)
  const frontLight1 = createLight(new Euler(-4, Math.PI * 0.1, 0), 2)
  const frontLight2 = createLight(new Euler(-4, -Math.PI * 0.1, 0), 2)
  return {
    backLight,
    frontLight1,
    frontLight2
  }
}

const initializePreviewPanel = (id: string) => {
  const cameraEntity = createEntity()
  setComponent(cameraEntity, CameraComponent)
  setComponent(cameraEntity, TransformComponent, { position: new Vector3(0, 0, -5) })
  setComponent(cameraEntity, VisibleComponent, true)
  setComponent(cameraEntity, NameComponent, '3D Preview Camera for ' + id)
  setComponent(cameraEntity, CameraOrbitComponent, { inputEntity: defineQuery([InputSourceComponent])().pop() })
  setComponent(cameraEntity, ObjectLayerMaskComponent)
  ObjectLayerMaskComponent.setLayer(cameraEntity, ObjectLayers.AssetPreview)
  const previewEntity = createEntity()
  getMutableState(PreviewPanelRendererState).entities[id].set([cameraEntity, previewEntity])
}

export function useRender3DPanelSystem(panel: React.MutableRefObject<HTMLDivElement>) {
  const state = useHookstateFromFactory(initialize3D)
  const rendererState = getMutableState(PreviewPanelRendererState)

  const resize = () => {
    if (!panel.current?.id) return
    const bounds = panel.current.getBoundingClientRect()!
    const camera = getComponent(rendererState.entities[panel.current.id].value[0], CameraComponent)
    camera.aspect = bounds.width / bounds.height
    camera.updateProjectionMatrix()
    rendererState.renderers.value[panel.current.id].setSize(bounds.width, bounds.height)
  }

  useEffect(() => {
    window.addEventListener('resize', resize)

    if (!rendererState.renderers.value[panel.current.id]) {
      rendererState.renderers[panel.current.id].set(
        new WebGLRenderer({
          antialias: true,
          preserveDrawingBuffer: true,
          alpha: true
        })
      )
      rendererState.renderers[panel.current.id].value.domElement.id = panel.current.id
      addClientInputListeners(rendererState.renderers[panel.current.id].domElement.value)
      rendererState.ids.set([...rendererState.ids.value, panel.current.id])
    }

    initializePreviewPanel(panel.current.id)

    resize()

    return () => {
      removeEntity(state.backLight.value)
      removeEntity(state.frontLight1.value)
      removeEntity(state.frontLight2.value)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    if (!panel.current || !rendererState.renderers.value) return
    const bounds = panel.current.getBoundingClientRect()
    const thisRenderer = rendererState.renderers.value[panel.current.id]
    thisRenderer.setSize(bounds.width, bounds.height)
    panel.current.appendChild(thisRenderer.domElement)
    resize()

    return () => {
      if (panel.current && rendererState.value[panel.current.id])
        panel.current.removeChild(rendererState.value[panel.current.id].domElement)
    }
  }, [panel.current, state])

  return { state, resize }
}

const inputQuery = defineQuery([InputSourceComponent])
export const render3DPanelSystem = defineSystem({
  uuid: 'ee.client.render3DPanelSystem',
  insert: { with: PresentationSystemGroup },
  execute: () => {
    const rendererState = getMutableState(PreviewPanelRendererState)
    // only render if this menu is open
    if (rendererState.renderers.value) {
      for (const id of rendererState.ids.value) {
        const cameraEntity = rendererState.entities[id].value[0]
        const group = getOptionalComponent(rendererState.entities[id].value[1], GroupComponent)
        if (group) enableObjectLayer(group[0], 31, true)
        const cameraComponent = getComponent(cameraEntity, CameraComponent)
        // sync with view camera
        const viewCamera = cameraComponent.cameras[0]
        viewCamera.projectionMatrix.copy(cameraComponent.projectionMatrix)
        viewCamera.quaternion.copy(cameraComponent.quaternion)
        viewCamera.position.copy(cameraComponent.position)
        viewCamera.layers.mask = getComponent(cameraEntity, ObjectLayerMaskComponent)
        rendererState.renderers[id].value.render(Engine.instance.scene, viewCamera)

        if (group) enableObjectLayer(group[0], 31, false)
      }
    }
  }
})
