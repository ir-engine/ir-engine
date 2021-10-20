import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { createAvatarDetailView } from './ui/AvatarDetailView'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Quaternion, Vector3 } from 'three'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'

export const AvatarUI = new Map<Entity, ReturnType<typeof createAvatarDetailView>>()

export default async function AvatarUISystem(world: World): Promise<System> {
  const userQuery = defineQuery([AvatarComponent, TransformComponent, NetworkObjectComponent])

  return () => {
    for (const userEntity of userQuery.enter()) {
      if (userEntity === world.localClientEntity) continue
      const userId = getComponent(userEntity, NetworkObjectComponent).userId
      const ui = createAvatarDetailView(userId)
      AvatarUI.set(userEntity, ui)
      addComponent(ui.entity, TransformComponent, {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3(1, 1, 1)
      })
    }

    for (const userEntity of userQuery()) {
      if (userEntity === world.localClientEntity) continue
      const ui = AvatarUI.get(userEntity)!
      const { avatarHeight } = getComponent(userEntity, AvatarComponent)
      const userTransform = getComponent(userEntity, TransformComponent)
      const transform = getComponent(ui.entity, TransformComponent)
      transform.scale.setScalar(Math.max(1, Engine.camera.position.distanceTo(userTransform.position) / 3))
      transform.position.copy(userTransform.position)
      transform.position.y += avatarHeight + 0.3
      transform.rotation.setFromRotationMatrix(Engine.camera.matrix)
    }

    for (const userEntity of userQuery.exit()) {
      if (userEntity === world.localClientEntity) continue
      const entity = AvatarUI.get(userEntity)?.entity
      if (typeof entity !== 'undefined') removeEntity(entity)
      AvatarUI.delete(userEntity)
    }

    return world
  }
}
