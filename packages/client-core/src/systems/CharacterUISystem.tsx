import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, getComponent, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { LocalInputReceiverComponent } from '@xrengine/engine/src/input/components/LocalInputReceiverComponent'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { createCharacterDetailView } from './ui/CharacterDetailView'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Not, defineQuery, enterQuery, defineSystem, System, exitQuery } from '@xrengine/engine/src/ecs/bitecs'
import { Quaternion, Vector3 } from 'three'
import { ECSWorld } from '@xrengine/engine/src/ecs/classes/World'

// TODO: This becomes an AoS component post-ecs refactor
export const CharacterUI = new Map<Entity, ReturnType<typeof createCharacterDetailView>>()

export const CharacterUISystem = async (): Promise<System> => {
  const networkUserQuery = defineQuery([
    Not(LocalInputReceiverComponent),
    AvatarComponent,
    TransformComponent,
    NetworkObjectComponent
  ])
  const networkUserAddQuery = enterQuery(networkUserQuery)
  const networkUserRemoveQuery = exitQuery(networkUserQuery)

  return defineSystem((world: ECSWorld) => {
    for (const userEntity of networkUserAddQuery(world)) {
      const userId = getComponent(userEntity, NetworkObjectComponent).ownerId
      const ui = createCharacterDetailView(userId)
      CharacterUI.set(userEntity, ui)
      addComponent(ui.entity, TransformComponent, {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3(1, 1, 1)
      })
    }

    for (const userEntity of networkUserQuery(world)) {
      const ui = CharacterUI.get(userEntity)!
      const { avatarHeight } = getComponent(userEntity, AvatarComponent)
      const userTransform = getComponent(userEntity, TransformComponent)
      const transform = getComponent(ui.entity, TransformComponent)
      transform.scale.setScalar(Math.max(1, Engine.camera.position.distanceTo(userTransform.position) / 3))
      transform.position.copy(userTransform.position)
      transform.position.y += avatarHeight + 0.3
      transform.rotation.setFromRotationMatrix(Engine.camera.matrix)
    }

    for (const userEntity of networkUserRemoveQuery(world)) {
      removeEntity(CharacterUI.get(userEntity)!.entity)
      CharacterUI.delete(userEntity)
    }

    return world
  })
}
