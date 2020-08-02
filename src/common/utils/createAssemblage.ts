import { Entity } from "ecsy"
import { NetworkPlayerCharacter } from "../../networking/defaults/assemblages/NetworkPlayerCharacter"

export function CreateAssemblage(id: any, isLocal = false) {
  const entity = new Entity()
  Object.keys(NetworkPlayerCharacter.components).forEach(value => {
    entity.addComponent(NetworkPlayerCharacter[value].type, { ownerId: id })
  })
  if (isLocal)
    Object.keys(NetworkPlayerCharacter.localComponents).forEach(value => {
      entity.addComponent(NetworkPlayerCharacter[value].type, { ownerId: id })
    })
}
