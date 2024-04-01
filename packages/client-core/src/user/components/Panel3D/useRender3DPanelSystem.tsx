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

import { createEntity, getComponent, setComponent } from '@etherealengine/ecs'
import { useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
// import { addClientInputListeners } from '@etherealengine/spatial/src/input/systems/ClientInputSystem'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { ObjectLayerMaskComponent } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { SceneComponent } from '@etherealengine/spatial/src/scene/SceneComponent'
import { removeEntityNodeRecursively } from '@etherealengine/spatial/src/transform/components/EntityTree'

export function useRender3DPanelSystem(canvas: React.MutableRefObject<HTMLCanvasElement>) {
  const panelState = useHookstate(() => ({
    cameraEntity: createEntity(),
    sceneEntity: createEntity()
  }))

  let id = ''
  const resize = () => {
    if (!canvas.current?.id) return
    const entity = panelState.cameraEntity.value
    const bounds = canvas.current.getBoundingClientRect()!
    const camera = getComponent(entity, CameraComponent)
    camera.aspect = bounds.width / bounds.height
    camera.updateProjectionMatrix()
    const renderer = getComponent(entity, RendererComponent)
    renderer.renderer.setSize(bounds.width, bounds.height)
  }

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

    id = canvas.current.id

    console.log(canvas.current)

    // if (!rendererState.environment.value.length) {
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
    // }

    const { cameraEntity, sceneEntity } = panelState.value
    setComponent(cameraEntity, CameraComponent)
    setComponent(cameraEntity, TransformComponent, { position: new Vector3(0, 0, 0) })
    setComponent(cameraEntity, VisibleComponent, true)
    setComponent(cameraEntity, NameComponent, '3D Preview Camera for ' + id)
    setComponent(cameraEntity, CameraOrbitComponent, { refocus: true })
    setComponent(cameraEntity, ObjectLayerMaskComponent)
    setComponent(cameraEntity, RendererComponent, { canvas: canvas.current })
    getComponent(cameraEntity, RendererComponent).initialize(cameraEntity)
    setComponent(cameraEntity, SceneComponent, { children: [sceneEntity] })
    setComponent(cameraEntity, InputComponent)

    resize()

    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [canvas.current])

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

  return {
    resize,
    ...panelState.value
  }
}
