import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, getComponent, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { LocalInputReceiverComponent } from '@xrengine/engine/src/input/components/LocalInputReceiverComponent'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { createAvatarDetailView } from './ui/AvatarDetailView'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Not, defineQuery, enterQuery, defineSystem, System, exitQuery } from '@xrengine/engine/src/ecs/bitecs'
import { Quaternion, Vector3 } from 'three'
import { ECSWorld } from '@xrengine/engine/src/ecs/classes/World'
import { Network } from '../../../engine/src/networking/classes/Network'

export const AvatarUI = new Map<Entity, ReturnType<typeof createAvatarDetailView>>()

export const AvatarUISystem = async (): Promise<System> => {
  const userQuery = defineQuery([AvatarComponent, TransformComponent, NetworkObjectComponent])
  const userEnterQuery = enterQuery(userQuery)
  const userExitQuery = exitQuery(userQuery)

  return defineSystem((world: ECSWorld) => {
    for (const userEntity of userEnterQuery(world)) {
      if (userEntity === Network.instance.localClientEntity) continue
      const userId = getComponent(userEntity, NetworkObjectComponent).uniqueId
      const ui = createAvatarDetailView(userId)
      AvatarUI.set(userEntity, ui)
      addComponent(ui.entity, TransformComponent, {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3(1, 1, 1)
      })
    }

    for (const userEntity of userQuery(world)) {
      if (userEntity === Network.instance.localClientEntity) continue
      const ui = AvatarUI.get(userEntity)!
      const { avatarHeight } = getComponent(userEntity, AvatarComponent)
      const userTransform = getComponent(userEntity, TransformComponent)
      const transform = getComponent(ui.entity, TransformComponent)
      transform.scale.setScalar(Math.max(1, Engine.camera.position.distanceTo(userTransform.position) / 3))
      transform.position.copy(userTransform.position)
      transform.position.y += avatarHeight + 0.3
      transform.rotation.setFromRotationMatrix(Engine.camera.matrix)
    }

    for (const userEntity of userExitQuery(world)) {
      if (userEntity === Network.instance.localClientEntity) continue
      removeEntity(AvatarUI.get(userEntity)!.entity)
      AvatarUI.delete(userEntity)
    }

    return world
  })
}
