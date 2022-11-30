import { useEffect } from 'react'
import { DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, sRGBEncoding, WebGLRenderer } from 'three'

import { useHookstateFromFactory } from '@xrengine/common/src/utils/useHookstateFromFactory'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { setComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'

const initialize3D = () => {
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
      const system = world.pipelines[SystemUpdateType.POST_RENDER].find((s) => s.uuid === systemUUID)
      if (system)
        world.pipelines[SystemUpdateType.POST_RENDER].splice(
          world.pipelines[SystemUpdateType.POST_RENDER].indexOf(system),
          1
        )
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
