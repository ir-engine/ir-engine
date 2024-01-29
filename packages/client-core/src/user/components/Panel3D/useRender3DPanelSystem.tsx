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
import { Euler, Quaternion, Vector3, WebGLRenderer } from 'three'

import {
  Engine,
  Entity,
  PresentationSystemGroup,
  UndefinedEntity,
  createEntity,
  defineQuery,
  defineSystem,
  getComponent,
  removeComponent,
  removeEntity,
  setComponent
} from '@etherealengine/ecs'
import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import {
  ActiveOrbitCamera,
  CameraOrbitComponent
} from '@etherealengine/engine/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@etherealengine/engine/src/common/NameComponent'
import { InputSourceComponent } from '@etherealengine/engine/src/input/components/InputSourceComponent'
import { addClientInputListeners } from '@etherealengine/engine/src/input/systems/ClientInputSystem'
import {
  ObjectLayerComponents,
  ObjectLayerMaskComponent
} from '@etherealengine/engine/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@etherealengine/engine/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/engine/src/renderer/constants/ObjectLayers'
import { DirectionalLightComponent } from '@etherealengine/engine/src/scene/components/DirectionalLightComponent'
import { iterateEntityNode } from '@etherealengine/engine/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { defineState, getMutableState, none } from '@etherealengine/hyperflux'

export const PreviewPanelRendererState = defineState({
  name: 'previewPanelRendererState',
  initial: () => ({
    environment: [] as Entity[],
    renderers: {} as Record<string, WebGLRenderer>,
    entities: {} as Record<string, Entity[]>,
    ids: [] as string[]
  })
})

export enum PanelEntities {
  'camera',
  'model'
}

const initializePreviewPanel = (id: string) => {
  const cameraEntity = createEntity()
  setComponent(cameraEntity, CameraComponent)
  setComponent(cameraEntity, TransformComponent, { position: new Vector3(0, 0, -1) })
  setComponent(cameraEntity, VisibleComponent, true)
  setComponent(cameraEntity, NameComponent, '3D Preview Camera for ' + id)
  setComponent(cameraEntity, CameraOrbitComponent, {
    inputEntity: defineQuery([InputSourceComponent])().pop(),
    refocus: true
  })
  setComponent(cameraEntity, ObjectLayerMaskComponent)
  ObjectLayerMaskComponent.setLayer(cameraEntity, ObjectLayers.AssetPreview)
  const previewEntity = createEntity()
  ObjectLayerMaskComponent.setLayer(previewEntity, ObjectLayers.AssetPreview)
  getMutableState(PreviewPanelRendererState).entities[id].set([cameraEntity, previewEntity])
}

export function useRender3DPanelSystem(panel: React.MutableRefObject<HTMLDivElement>) {
  const rendererState = getMutableState(PreviewPanelRendererState)

  let id = ''
  const resize = () => {
    if (!panel.current?.id) return
    const bounds = panel.current.getBoundingClientRect()!
    const camera = getComponent(rendererState.entities[id].value[PanelEntities.camera], CameraComponent)
    camera.aspect = bounds.width / bounds.height
    camera.updateProjectionMatrix()
    rendererState.renderers.value[id].setSize(bounds.width, bounds.height)
  }

  useEffect(() => {
    window.addEventListener('resize', resize)
    id = panel.current.id

    if (!rendererState.environment.value.length) {
      const createLight = (rotation: Euler, intensity: number) => {
        const light = createEntity()
        ObjectLayerMaskComponent.setLayer(light, ObjectLayers.AssetPreview)
        setComponent(light, TransformComponent, { rotation: new Quaternion().setFromEuler(rotation) })
        setComponent(light, DirectionalLightComponent, {
          intensity
        })
        setComponent(light, VisibleComponent, true)
        setComponent(light, NameComponent, '3D Preview Light')
        return light
      }
      const backLight = createLight(new Euler(-0.5, 0, 0), 2)
      const frontLight1 = createLight(new Euler(-4, Math.PI * 0.1, 0), 2)
      const frontLight2 = createLight(new Euler(-4, -Math.PI * 0.1, 0), 2)

      rendererState.environment.set([backLight, frontLight1, frontLight2])
    }

    if (!rendererState.renderers.value[id]) {
      rendererState.renderers[id].set(
        new WebGLRenderer({
          antialias: true,
          preserveDrawingBuffer: true,
          alpha: true
        })
      )
      const canvas = rendererState.renderers[id].value.domElement
      canvas.id = id
      canvas.tabIndex = 1
      addClientInputListeners(rendererState.renderers[id].domElement.value)
      rendererState.ids.set([...rendererState.ids.value, id])
    }

    initializePreviewPanel(id)

    resize()

    return () => {
      window.removeEventListener('resize', resize)
      // cleanup entities and state associated with this 3d panel
      removeEntity(
        getComponent(rendererState.entities[id].value[PanelEntities.camera], CameraOrbitComponent).inputEntity
      )
      for (const entity of rendererState.entities[id].value) removeEntity(entity)
      getMutableState(ActiveOrbitCamera).set(UndefinedEntity)
      const thisIdIndex = rendererState.ids.value.findIndex((value) => value === id)
      rendererState.ids[thisIdIndex].set(none)
      rendererState.renderers[id].set(none)
    }
  }, [])

  useEffect(() => {
    id = panel.current.id
    if (!panel.current || !rendererState.renderers.value) return
    const bounds = panel.current.getBoundingClientRect()
    const thisRenderer = rendererState.renderers.value[id]
    thisRenderer.setSize(bounds.width, bounds.height)
    panel.current.appendChild(thisRenderer.domElement)
    resize()

    return () => {
      if (panel.current && rendererState.value[id]) panel.current.removeChild(rendererState.value[id].domElement)
    }
  }, [panel.current])

  return { resize }
}

export const render3DPanelSystem = defineSystem({
  uuid: 'ee.client.render3DPanelSystem',
  insert: { with: PresentationSystemGroup },
  execute: () => {
    const rendererState = getMutableState(PreviewPanelRendererState)
    // only render if this menu is open
    if (rendererState.renderers.value) {
      for (const id of rendererState.ids.value) {
        const cameraEntity = rendererState.entities[id].value[PanelEntities.camera]
        const previewEntity = rendererState.entities[id].value[PanelEntities.model]
        iterateEntityNode(previewEntity, (entity) => {
          setComponent(entity, ObjectLayerComponents[ObjectLayers.AssetPreview])
        })
        const cameraComponent = getComponent(cameraEntity, CameraComponent)
        // sync with view camera
        const viewCamera = cameraComponent.cameras[0]
        viewCamera.projectionMatrix.copy(cameraComponent.projectionMatrix)
        viewCamera.quaternion.copy(cameraComponent.quaternion)
        viewCamera.position.copy(cameraComponent.position)
        viewCamera.layers.mask = getComponent(cameraEntity, ObjectLayerMaskComponent)
        // hack to make the background transparent for the preview
        const lastBackground = Engine.instance.scene.background
        Engine.instance.scene.background = null
        rendererState.renderers[id].value.render(Engine.instance.scene, viewCamera)
        Engine.instance.scene.background = lastBackground
        iterateEntityNode(previewEntity, (entity) => {
          removeComponent(entity, ObjectLayerComponents[ObjectLayers.AssetPreview])
        })
      }
    }
  }
})
