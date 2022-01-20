import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createLoaderDetailView } from './ui/XRUILoadingDetailView'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { PerspectiveCamera, MathUtils } from 'three'
import type { WebLayer3D } from '@etherealjs/web-layer/three'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'

export default async function XRUILoadingSystem(world: World): Promise<System> {
  const ui = createLoaderDetailView('')

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

        const ready = !Engine.isLoading && Engine.hasJoinedWorld
        xrui.container.rootLayer.traverseLayersPreOrder(ready ? transitionOut : transitionIn)
      }
    }
  }
}

function transitionIn(layer: WebLayer3D) {
  const world = useWorld()
  const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
  mat.opacity = MathUtils.lerp(mat.opacity, 1, world.delta * 10)
  mat.visible = true
}

function transitionOut(layer: WebLayer3D) {
  const world = useWorld()
  const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
  mat.opacity = MathUtils.lerp(mat.opacity, 0, world.delta * 10)
  if (mat.opacity < 0.01) mat.visible = false
}
