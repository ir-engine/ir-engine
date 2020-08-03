import { Entity, World, ComponentManager } from "ecsy"
import { NetworkPlayerCharacter } from "../../networking/defaults/assemblages/NetworkPlayerCharacter"

export function CreateAssemblage(world: World, id: any, isLocal = false) {
  const entity = world.createEntity()
  Object.keys(NetworkPlayerCharacter.components).forEach(value => {
      if(world.componentManager.)
    entity.addComponent(NetworkPlayerCharacter[value].type, { ownerId: id })
  })
  if (isLocal)
    Object.keys(NetworkPlayerCharacter.localComponents).forEach(value => {
      entity.addComponent(NetworkPlayerCharacter[value].type, { ownerId: id })
    })
}
