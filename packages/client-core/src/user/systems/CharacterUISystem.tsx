import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { System } from '@xrengine/engine/src/ecs/classes/System'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { addComponent, getComponent, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { Not } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { LocalInputReceiver } from '@xrengine/engine/src/input/components/LocalInputReceiver'
import { CharacterComponent } from '@xrengine/engine/src/character/components/CharacterComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { NetworkObject } from '@xrengine/engine/src/networking/components/NetworkObject'
import { TransformChildComponent } from '@xrengine/engine/src/transform/components/TransformChildComponent'
import { Vector3 } from 'three'
import { createCharacterDetailView } from './ui/CharacterDetailView'

// TODO: This becomes an AoS component post-ecs refactor
export const CharacterUI = new Map<Entity, ReturnType<typeof createCharacterDetailView>>()

export class CharacterUISystem extends System {
  updateType = SystemUpdateType.Fixed

  execute(): void {
    for (const userEntity of this.queryResults.networkUser.added!) {
      const { actorHeight } = getComponent(userEntity, CharacterComponent)
      const username = getComponent(userEntity, NetworkObject).ownerId
      const ui = createCharacterDetailView()
      ui.state.username.set(username)
      CharacterUI.set(userEntity, ui)
      addComponent(ui.entity, TransformComponent)
      addComponent(ui.entity, TransformChildComponent, {
        parent: userEntity,
        offsetPosition: new Vector3(0, actorHeight + 0.1, 0)
      })
      // addComponent(ui.entity, TransformBillboardComponent)
    }

    for (const userEntity of this.queryResults.networkUser.changed!) {
      const username = getComponent(userEntity, NetworkObject).ownerId
      const { state } = CharacterUI.get(userEntity)!
      state.username.set(username)
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
      removed: true,
      changed: [NetworkObject]
    }
  }
}
