import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import {
  addComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeEntity
} from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { Not } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { LocalInputReceiver } from '@xrengine/engine/src/input/components/LocalInputReceiver'
import { CharacterComponent } from '@xrengine/engine/src/character/components/CharacterComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { NetworkObject } from '@xrengine/engine/src/networking/components/NetworkObject'
import { createCharacterDetailView } from './ui/CharacterDetailView'
import { Engine } from '../../../engine/src/ecs/classes/Engine'

// TODO: This becomes an AoS component post-ecs refactor
export const CharacterUI = new Map<Entity, ReturnType<typeof createCharacterDetailView>>()

export class CharacterUISystem extends System {
  execute(): void {
    for (const userEntity of this.queryResults.networkUser.added!) {
      const userId = getComponent(userEntity, NetworkObject).ownerId
      const ui = createCharacterDetailView(userId)
      CharacterUI.set(userEntity, ui)
      addComponent(ui.entity, TransformComponent)
    }

    for (const userEntity of this.queryResults.networkUser.all!) {
      const ui = CharacterUI.get(userEntity)!
      const { actorHeight } = getComponent(userEntity, CharacterComponent)
      const userTransform = getMutableComponent(userEntity, TransformComponent)
      const transform = getMutableComponent(ui.entity, TransformComponent)
      transform.scale.setScalar(Math.max(1, Engine.camera.position.distanceTo(userTransform.position) / 3))
      transform.position.copy(userTransform.position)
      transform.position.y += actorHeight + 0.3
      transform.rotation.setFromRotationMatrix(Engine.camera.matrix)
    }

    for (const userEntity of this.queryResults.networkUser.removed!) {
      removeEntity(CharacterUI.get(userEntity)!.entity)
      CharacterUI.delete(userEntity)
    }
  }
}

CharacterUISystem.queries = {
  networkUser: {
    components: [Not(LocalInputReceiver), CharacterComponent, TransformComponent, NetworkObject],
    listen: {
      added: true,
      removed: true
    }
  }
}
