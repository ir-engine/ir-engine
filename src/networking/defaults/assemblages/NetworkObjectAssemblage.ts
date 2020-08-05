// Components
import { Assemblage } from "../../../common/interfaces/Assemblage"
import TransformComponent from "../../../transform/components/TransformComponent"
import NetworkObject from "../components/NetworkObject"

// Assemblage is a pattern for creating an entity and component collection as a prototype
export const NetworkObjectAssemblage: Assemblage = {
  components: [{ type: NetworkObject }, { type: TransformComponent }]
}
