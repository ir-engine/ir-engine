import { useEffect } from 'react'
import { DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, sRGBEncoding, WebGLRenderer } from 'three'

import { useHookstateFromFactory } from '@etherealengine/common/src/utils/useHookstateFromFactory'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { World } from '@etherealengine/engine/src/ecs/classes/World'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { initSystems, unloadSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@etherealengine/engine/src/ecs/functions/SystemUpdateType'
import { getOrbitControls } from '@etherealengine/engine/src/input/functions/loadOrbitControl'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'

const initialize3D = () => {
  const camera = new PerspectiveCamera(60, 1, 0.25, 20)
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
    if (!panel.current || !state.camera.value) return
    const bounds = panel.current.getBoundingClientRect()!
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

    const systemUUID = 'xre.client.AvatarSelectRenderSystem-' + i++

    initSystems(world, [
      {
        uuid: systemUUID,
        type: SystemUpdateType.POST_RENDER,
        systemLoader: () => Promise.resolve({ default: AvatarSelectRenderSystem })
      }
    ])

    return () => {
      unloadSystem(world, systemUUID)
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
