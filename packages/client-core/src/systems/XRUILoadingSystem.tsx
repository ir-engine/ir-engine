import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createLoaderDetailView } from './ui/XRUILoadingDetailView'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { PerspectiveCamera, MathUtils } from 'three'
import type { WebLayer3D } from '@etherealjs/web-layer/three'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { receiveActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'

type TransitionType = 'IN' | 'OUT' | 'NONE'

export default async function XRUILoadingSystem(world: World) {
  const ui = createLoaderDetailView('')
  const transitionPeriodSeconds = 1
  let currentState = 'NONE' as TransitionType
  let alpha = 0 // alpha is a number between 0 and 1

  function setState(state: TransitionType) {
    currentState = state
    alpha = 0
  }

  receiveActionOnce(EngineEvents.EVENTS.JOINED_WORLD, () => setTimeout(() => setState('OUT'), 1000))

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

        const setOpacity = (opacity) =>
          xrui.container.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
            // console.log('setOpacity', opacity)
            const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
            mat.opacity = opacity
            mat.visible = opacity > 0
            layer.visible = opacity > 0
          })

        if (currentState !== 'NONE') {
          alpha += world.delta / transitionPeriodSeconds
          alpha = MathUtils.clamp(alpha, 0, 1)
          setOpacity(currentState === 'IN' ? alpha : 1 - alpha)
          if (alpha > 1) setState('NONE')
        }
      }
    }
  }
}
