

// Components
import NetworkSchema from "../interfaces/NetworkSchema"
import { Assemblage } from "../../common/interfaces/Assemblage"
import NetworkObject from "./components/NetworkObject"
import TransformComponent from "../.."

// Assemblage is a pattern for creating an entity and component collection as a prototype
export const NetworkPlayerCharacter: Assemblage = {
  
}

export const DefaultAssemblages = {
  Player: {
    components: [{ type: NetworkObject }, { type: Avatar }, { type: TransformComponent }],
    localComponents: [{ type: Input }, { type: Camera }]
  }
}

const DefaultNetworkSchema: NetworkSchema {
  messageHandlers: {
  },
  assemblages: {

  },
  defaultPlayerAssemblage: {

  }
  
}
