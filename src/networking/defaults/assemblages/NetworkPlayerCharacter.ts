// Components
import { Assemblage } from "../../../common/interfaces/Assemblage"
import TransformComponent from "../../../common"
import NetworkAvatar from "../components/NetworkAvatar"
import Input from "../../../input/components/Input"

// Assemblage is a pattern for creating an entity and component collection as a prototype
export const NetworkPlayerCharacter: Assemblage = {
  components: [{ type: NetworkAvatar }, { type: TransformComponent }],
  localComponents: [{ type: Input }, { type: Camera }]
}
