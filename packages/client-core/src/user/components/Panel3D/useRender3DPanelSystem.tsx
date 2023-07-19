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
import { DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, SRGBColorSpace, WebGLRenderer } from 'three'

import { useHookstateFromFactory } from '@etherealengine/common/src/utils/useHookstateFromFactory'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { createEntity, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { defineSystem, disableSystem, startSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { getOrbitControls } from '@etherealengine/engine/src/input/functions/loadOrbitControl'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'

const initialize3D = () => {
  const camera = new PerspectiveCamera(60, 1, 0.25, 200)
  camera.position.set(0, 1.75, 0.5)
  camera.layers.set(ObjectLayers.Panel)

  const scene = new Scene()

  const backLight = new DirectionalLight(0xfafaff, 0.5)
  backLight.position.set(1, 3, -1)
  backLight.target.position.set(0, 1.5, 0)
  const frontLight = new DirectionalLight(0xfafaff, 0.4)
  frontLight.position.set(-1, 3, 1)
  frontLight.target.position.set(0, 1.5, 0)
  const hemi = new HemisphereLight(0xffffff, 0xffffff, 1)
  scene.add(backLight)
  scene.add(backLight.target)
  scene.add(frontLight)
  scene.add(frontLight.target)
  scene.add(hemi)

  scene.traverse((obj) => {
    obj.layers.set(ObjectLayers.Panel)
  })
  const renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.outputColorSpace = SRGBColorSpace

  const controls = getOrbitControls(camera, renderer.domElement)

  controls.minDistance = 0.1
  controls.maxDistance = 100
  controls.target.set(0, 1.65, 0)
  controls.update()
  const entity = createEntity()
  setComponent(entity, NameComponent, '3D Preview Entity')

  return {
    controls,
    scene,
    camera,
    renderer,
    entity
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
      execute: () => {
        // only render if this menu is open
        if (!!panel.current && state.renderer.value) {
          state.controls.value.update()
          state.renderer.value.render(state.scene.value, state.camera.value)
        }
      }
    })

    startSystem(AvatarSelectRenderSystem, { after: PresentationSystemGroup })

    return () => {
      disableSystem(AvatarSelectRenderSystem)
      // todo - do we need to remove the system defintion?
      removeEntity(state.entity.value)
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
