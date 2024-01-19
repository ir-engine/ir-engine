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

import { useEffect } from 'react'
import { Color, DirectionalLight, Euler, PerspectiveCamera, Quaternion, SRGBColorSpace, WebGLRenderer } from 'three'

import { useHookstateFromFactory } from '@etherealengine/common/src/utils/useHookstateFromFactory'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { createEntity, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { defineSystem, destroySystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { getOrbitControls } from '@etherealengine/engine/src/input/functions/loadOrbitControl'
import { DirectionalLightComponent } from '@etherealengine/engine/src/scene/components/DirectionalLightComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { ObjectLayerMaskComponent } from '@etherealengine/engine/src/scene/components/ObjectLayerComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { defineState, getState } from '@etherealengine/hyperflux'

export const PreviewPanelRendererState = defineState({
  name: 'previewPanelRendererState',
  initial: () => ({
    renderer: new WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: true
    })
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

  const camera = new PerspectiveCamera(60, 1, 0.25, 1000)
  camera.position.set(0, 1.75, 0.5)
  camera.layers.set(ObjectLayers.AssetPreview)

  const renderer = getState(PreviewPanelRendererState).renderer
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.outputColorSpace = SRGBColorSpace

  const controls = getOrbitControls(camera, renderer.domElement)
  controls.minDistance = 0.1
  controls.maxDistance = 10000
  controls.target.set(0, 1.65, 0)
  controls.update()

  const backLight = createLight(new Euler(-0.5, 0, 0), 2)
  const frontLight1 = createLight(new Euler(-4, Math.PI * 0.1, 0), 2)
  const frontLight2 = createLight(new Euler(-4, -Math.PI * 0.1, 0), 2)
  const previewEntity = null as Entity | null
  return {
    controls,
    camera,
    renderer,
    previewEntity,
    backLight,
    frontLight1,
    frontLight2
  }
}

let i = 0

export function useRender3DPanelSystem(panel: React.MutableRefObject<HTMLDivElement>) {
  const state = useHookstateFromFactory(initialize3D)

  const resize = () => {
    if (!panel.current || !state.camera.value) return
    const bounds = panel.current.getBoundingClientRect()!
    state.camera.value.aspect = bounds.width / bounds.height
    state.camera.value.updateProjectionMatrix()
    state.renderer.value.setSize(bounds.width, bounds.height)
  }

  useEffect(() => {
    window.addEventListener('resize', resize)
    resize()

    const AvatarSelectRenderSystem = defineSystem({
      uuid: 'ee.client.AvatarSelectRenderSystem-' + i++,
      insert: { with: PresentationSystemGroup },
      execute: () => {
        // only render if this menu is open
        if (!!panel.current && state.renderer.value) {
          state.controls.value.update()
          state.renderer.value.render(Engine.instance.scene, state.camera.value)
        }
      }
    })

    return () => {
      destroySystem(AvatarSelectRenderSystem)
      // todo - do we need to remove the system defintion?
      if (state.previewEntity.value) removeEntity(state.previewEntity.value)
      removeEntity(state.backLight.value)
      removeEntity(state.frontLight1.value)
      removeEntity(state.frontLight2.value)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    if (!panel.current || !state.renderer.value) return
    const bounds = panel.current.getBoundingClientRect()
    state.renderer.value.setSize(bounds.width, bounds.height)
    panel.current.appendChild(state.renderer.value.domElement)
    resize()
    return () => {
      if (panel.current) panel.current.removeChild(state.renderer.value.domElement)
    }
  }, [panel.current, state])

  return { state, resize }
}
