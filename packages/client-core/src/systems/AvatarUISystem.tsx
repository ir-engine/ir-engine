import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'

import { createAvatarDetailView } from './ui/AvatarDetailView'
import { createAvatarContextMenuView } from './ui/PersonMenuView'

export const AvatarUI = new Map<Entity, ReturnType<typeof createAvatarDetailView>>()
export const AvatarContextMenuUI = new Map<Entity, ReturnType<typeof createAvatarContextMenuView>>()

export default async function AvatarUISystem(world: World): Promise<System> {
  const userQuery = defineQuery([AvatarComponent, TransformComponent, NetworkObjectComponent])

  return () => {
    for (const userEntity of userQuery.enter()) {
      if (userEntity === world.localClientEntity) continue
      if (AvatarUI.has(userEntity)) {
        console.log('entity already exists: ' + userEntity)
        continue
      }
      const userId = getComponent(userEntity, NetworkObjectComponent).ownerId
      const ui = createAvatarDetailView(userId)
      const contextMenuUI = createAvatarContextMenuView(userId)
      AvatarUI.set(userEntity, ui)
      AvatarContextMenuUI.set(userEntity, contextMenuUI)
    }

    for (const userEntity of userQuery()) {
      if (userEntity === world.localClientEntity) continue
      const ui = AvatarUI.get(userEntity)!
      const { avatarHeight } = getComponent(userEntity, AvatarComponent)
      const userTransform = getComponent(userEntity, TransformComponent)
      const xrui = getComponent(ui.entity, XRUIComponent)
      if (!xrui) return
      xrui.layer.scale.setScalar(Math.max(1, Engine.camera.position.distanceTo(userTransform.position) / 3))
      xrui.layer.position.copy(userTransform.position)
      xrui.layer.position.y += avatarHeight + 0.3
      xrui.layer.rotation.setFromRotationMatrix(Engine.camera.matrix)

      const contextMenuUI = AvatarContextMenuUI.get(userEntity)!
      const contextMenuXRUI = getComponent(contextMenuUI.entity, XRUIComponent)
      if (!xrui) return
      contextMenuXRUI.layer.scale.setScalar(Math.max(1, Engine.camera.position.distanceTo(userTransform.position) / 3))
      contextMenuXRUI.layer.position.copy(userTransform.position)
      contextMenuXRUI.layer.position.y += avatarHeight - 0.3
      contextMenuXRUI.layer.position.x += 1
      contextMenuXRUI.layer.rotation.setFromRotationMatrix(Engine.camera.matrix)
    }

    for (const userEntity of userQuery.exit()) {
      if (userEntity === world.localClientEntity) continue

      const entity = AvatarUI.get(userEntity)?.entity
      if (typeof entity !== 'undefined') removeEntity(entity)
      AvatarUI.delete(userEntity)

      const contextMenuEntity = AvatarContextMenuUI.get(userEntity)?.entity
      if (typeof contextMenuEntity !== 'undefined') removeEntity(contextMenuEntity)
      AvatarContextMenuUI.delete(userEntity)
    }

    return world
  }
}
