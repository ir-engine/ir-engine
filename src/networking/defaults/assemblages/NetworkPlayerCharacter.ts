// Components
import { Assemblage } from "../../../common/interfaces/Assemblage"
import { TransformComponent } from "../../../common"
import NetworkAvatar from "../components/NetworkAvatar"
import Input from "../../../input/components/Input"
import { Entity } from "ecsy"

// Assemblage is a pattern for creating an entity and component collection as a prototype
export const NetworkPlayerCharacter: Assemblage = {
  components: [{ type: NetworkAvatar }, { type: TransformComponent }],
  localComponents: [{ type: Input }, { type: Camera }]
}

export function CreateCharacter(id: any, isLocal = false) {
  const characterEntity = new Entity()
  Object.keys(NetworkPlayerCharacter.components).forEach(value => {
    characterEntity.addComponent(NetworkPlayerCharacter[value].type, { ownerId: id })
  })
  if (isLocal)
    Object.keys(NetworkPlayerCharacter.localComponents).forEach(value => {
      characterEntity.addComponent(NetworkPlayerCharacter[value].type, { ownerId: id })
    })
}
