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
import { Vector3 } from 'three'

import { Entity, UndefinedEntity, createEntity, getComponent, removeEntity, setComponent } from '@etherealengine/ecs'
import { defineState, getMutableState, none, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
// import { addClientInputListeners } from '@etherealengine/spatial/src/input/systems/ClientInputSystem'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { ObjectLayerMaskComponent } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'

export const PreviewPanelRendererState = defineState({
  name: 'previewPanelRendererState',
  initial: () => ({
    environment: [] as Entity[],
    entities: {} as Record<string, Entity[]>,
    ids: [] as string[]
  })
})

export enum PanelEntities {
  'camera',
  'model'
}

export function useRender3DPanelSystem(canvas: React.MutableRefObject<HTMLCanvasElement>) {
  const rendererState = useMutableState(PreviewPanelRendererState)
  const rendererEntity = useHookstate(UndefinedEntity)

  let id = ''
  const resize = () => {
    if (!canvas.current?.id) return
    const entity = rendererEntity.value
    const bounds = canvas.current.getBoundingClientRect()!
    const camera = getComponent(entity, CameraComponent)
    camera.aspect = bounds.width / bounds.height
    camera.updateProjectionMatrix()
    const renderer = getComponent(entity, RendererComponent)
    renderer.renderer.setSize(bounds.width, bounds.height)
  }

  useEffect(() => {
    // window.addEventListener('resize', resize)
    id = canvas.current.id

    if (!rendererState.environment.value.length) {
      // const createLight = (rotation: Euler, intensity: number) => {
      //   const light = createEntity()
      //   ObjectLayerMaskComponent.setLayer(light, ObjectLayers.AssetPreview)
      //   setComponent(light, TransformComponent, { rotation: new Quaternion().setFromEuler(rotation) })
      //   setComponent(light, DirectionalLightComponent, {
      //     intensity,
      //     useInCSM: false
      //   })
      //   setComponent(light, VisibleComponent, true)
      //   setComponent(light, NameComponent, '3D Preview Light')
      //   return light
      // }
      /**@todo fix csm issues this causes */
      // const backLight = createLight(new Euler(-0.5, 0, 0), 2)
      // const frontLight1 = createLight(new Euler(-4, Math.PI * 0.1, 0), 2)
      // const frontLight2 = createLight(new Euler(-4, -Math.PI * 0.1, 0), 2)
      // rendererState.environment.set([backLight, frontLight1, frontLight2])
    }

    const cameraEntity = createEntity()
    setComponent(cameraEntity, CameraComponent)
    setComponent(cameraEntity, TransformComponent, { position: new Vector3(0, 0, 0) })
    setComponent(cameraEntity, VisibleComponent, true)
    setComponent(cameraEntity, NameComponent, '3D Preview Camera for ' + id)
    setComponent(cameraEntity, CameraOrbitComponent, { refocus: true })
    setComponent(cameraEntity, ObjectLayerMaskComponent)
    ObjectLayerMaskComponent.setLayer(cameraEntity, ObjectLayers.AssetPreview)
    const previewEntity = createEntity()
    ObjectLayerMaskComponent.setLayer(previewEntity, ObjectLayers.AssetPreview)
    getMutableState(PreviewPanelRendererState).entities[id].set([cameraEntity, previewEntity])

    setComponent(cameraEntity, RendererComponent, { canvas: canvas.current })
    getComponent(cameraEntity, RendererComponent).initialize(cameraEntity)

    resize()

    return () => {
      window.removeEventListener('resize', resize)
      // cleanup entities and state associated with this 3d panel
      for (const entity of rendererState.entities[id].value) removeEntity(entity)
      const thisIdIndex = rendererState.ids.value.findIndex((value) => value === id)
      rendererState.entities[id].set(none)
      rendererState.ids[thisIdIndex].set(none)
    }
  }, [])

  // useEffect(() => {
  //   id = canvas.current.id
  //   if (!canvas.current || !rendererState.renderers.value) return
  //   const bounds = canvas.current.getBoundingClientRect()
  //   const thisRenderer = rendererState.renderers.value[id]
  //   thisRenderer.setSize(bounds.width, bounds.height)
  //   canvas.current.appendChild(thisRenderer.domElement)
  //   resize()

  //   return () => {
  //     if (canvas.current && rendererState.value[id]) canvas.current.removeChild(rendererState.value[id].domElement)
  //   }
  // }, [canvas.current])

  return { resize }
}
