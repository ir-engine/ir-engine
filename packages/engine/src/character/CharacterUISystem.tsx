import { Entity } from '../ecs/classes/Entity'
import { System } from '../ecs/classes/System'
import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import { addComponent, getComponent, removeEntity } from '../ecs/functions/EntityFunctions'
import { Not } from '../ecs/functions/ComponentFunctions'
import { LocalInputReceiver } from '../input/components/LocalInputReceiver'
import { CharacterComponent } from './components/CharacterComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { NetworkObject } from '../networking/components/NetworkObject'
import { TransformChildComponent } from '../transform/components/TransformChildComponent'
import { Vector3 } from 'three'
import { createCharacterDetailView } from './ui/CharacterDetailView'

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
