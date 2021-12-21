import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createLoaderDetailView } from './ui/XRUILoadingDetailView'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { PerspectiveCamera, MathUtils } from 'three'

export const LoaderUI = new Map<Entity, ReturnType<typeof createLoaderDetailView>>()

export default async function XRUILoadingSystem(world: World): Promise<System> {
  return () => {
    if (Engine.activeCameraEntity) {
      const uiEntity = LoaderUI.get(Engine.activeCameraEntity)!
      if (!uiEntity) {
        const ui = createLoaderDetailView('')
        LoaderUI.set(Engine.activeCameraEntity, ui)
      } else {
        const xrui = getComponent(uiEntity.entity, XRUIComponent)

        if (xrui) {
          const camera = Engine.camera as PerspectiveCamera
          const dist = 0.1
          xrui.layer.parent = camera
          xrui.layer.position.z = -dist
          const vFOV = MathUtils.degToRad(camera.fov)
          const height = Math.tan(vFOV / 2) * dist * 2
          const scale = height * camera.aspect
          xrui.layer.scale.x = xrui.layer.scale.y = scale
        }
      }
    }
    return world
  }
}
