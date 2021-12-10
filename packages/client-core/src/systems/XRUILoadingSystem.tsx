import { Vector3, Quaternion } from 'three'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity, createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { createLoaderDetailView } from './ui/XRUILoadingDetailView'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import {
  AmbientLight,
  Box3,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Color,
  MathUtils
} from 'three'

export const LoaderUI = new Map<Entity, ReturnType<typeof createLoaderDetailView>>()

export default async function XRUILoadingSystem(world: World): Promise<System> {
  return () => {
    if (Engine.activeCameraEntity) {
      const uiEntity = LoaderUI.get(Engine.activeCameraEntity)
      if (!uiEntity) {
        const ui = createLoaderDetailView('')
        LoaderUI.set(Engine.activeCameraEntity, ui)
      } else {
        const xrui = getComponent(uiEntity!.entity, XRUIComponent)
        if (xrui) {
          const dist = 0.1
          xrui.layer.parent = Engine.camera
          xrui.layer.position.z = -dist
          //@ts-ignore
          var vFOV = MathUtils.degToRad(Engine.camera.fov)
          var height = Math.tan(vFOV / 2) * dist * 2
          //@ts-ignore
          var scale = height * Engine.camera.aspect
          xrui.layer.scale.x = xrui.layer.scale.y = scale
        }
      }
    }
    return world
  }
}
