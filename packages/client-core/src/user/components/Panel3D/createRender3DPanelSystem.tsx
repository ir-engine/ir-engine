import { useHookstate } from '@hookstate/core'
import { useEffect, useState } from 'react'
import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  Vector2,
  WebGLRenderer
} from 'three'

import { useHookstateFromFactory } from '@xrengine/common/src/utils/useHookstateFromFactory'
import { updateAnimationGraph } from '@xrengine/engine/src/avatar/animation/AnimationGraph'
import { AvatarAnimationComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { getComponent, setComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

const initialize3D = () => {
  console.log('initialize 3d')
  const camera = new PerspectiveCamera(60, 1, 0.25, 20)
  camera.position.set(0, 1.75, 0.5)

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
  const renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.outputEncoding = sRGBEncoding

  const controls = getOrbitControls(camera, renderer.domElement)

  controls.minDistance = 0.1
  controls.maxDistance = 10
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
    console.log('onWindowResize', panel.current, state.camera.value)
    if (!panel.current || !state.camera.value) return
    const bounds = panel.current.getBoundingClientRect()!
    console.log(panel.current, bounds)
    state.camera.value.aspect = bounds.width / bounds.height
    state.camera.value.updateProjectionMatrix()
    state.renderer.value.setSize(bounds.width, bounds.height)
  }

  useEffect(() => {
    const world = Engine.instance.currentWorld

    window.addEventListener('resize', resize)
    resize()

    async function AvatarSelectRenderSystem(world: World) {
      return {
        execute: () => {
          // only render if this menu is open
          if (!!panel.current && state.renderer.value) {
            state.controls.value.update()
            state.renderer.value.render(state.scene.value, state.camera.value)
          }
        },
        cleanup: async () => {}
      }
    }

    initSystems(world, [
      {
        uuid: 'xre.client.AvatarSelectRenderSystem-' + i++,
        type: SystemUpdateType.POST_RENDER,
        systemLoader: () => Promise.resolve({ default: AvatarSelectRenderSystem })
      }
    ])

    return () => {
      console.log('unmount')
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
