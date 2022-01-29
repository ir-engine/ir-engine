import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createLoaderDetailView } from './ui/XRUILoadingDetailView'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { PerspectiveCamera, MathUtils } from 'three'
import type { WebLayer3D } from '@etherealjs/web-layer/three'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { receiveActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { createTransitionState } from '@xrengine/engine/src/xrui/functions/createTransitionState'
import { LoadingSystemState } from './state/LoadingState'

export default async function XRUILoadingSystem(world: World) {
  const ui = createLoaderDetailView('')

  const transitionPeriodSeconds = 1
  const transition = createTransitionState(transitionPeriodSeconds)

  // todo: push timeout to accumulator
  receiveActionOnce(EngineEvents.EVENTS.JOINED_WORLD, () => setTimeout(() => transition.setState('OUT'), 1000))

  await ui.ready

  return () => {
    if (Engine.activeCameraEntity) {
      const xrui = getComponent(ui.entity, XRUIComponent)

      if (xrui) {
        const camera = Engine.camera as PerspectiveCamera
        const dist = 0.1
        xrui.container.parent = camera
        xrui.container.position.z = -dist

        const ppu = xrui.container.options.manager.pixelsPerUnit
        const contentWidth = ui.state.imageWidth.value / ppu
        const contentHeight = ui.state.imageHeight.value / ppu
        const ratioContent = contentWidth / contentHeight
        const ratioCamera = camera.aspect

        const useHeight = ratioContent > ratioCamera

        const vFOV = MathUtils.degToRad(camera.fov)
        const targetHeight = Math.tan(vFOV / 2) * dist * 2
        const targetWidth = targetHeight * camera.aspect

        let scale = 1
        if (useHeight) {
          scale = targetHeight / contentHeight
        } else {
          scale = targetWidth / contentWidth
        }

        xrui.container.scale.x = xrui.container.scale.y = scale

        transition.update(world, (opacity) => {
          if (opacity !== LoadingSystemState.opacity.value) LoadingSystemState.opacity.set(opacity)
          xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
            // console.log('setOpacity', opacity)
            const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
            mat.opacity = opacity
            mat.visible = opacity > 0
            layer.visible = opacity > 0
          })
        })
      }
    }
  }
}
