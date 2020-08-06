// Components
import NetworkSchema from "../interfaces/NetworkSchema"
import NetworkObject from "./components/NetworkObject"
import { NetworkAssemblage } from "../interfaces/NetworkAssemblage"
import Input from "../../input/components/Input"
import TransformComponent from "../../transform/components/TransformComponent"
import Camera from "../../camera/components/Camera"
import Actor from "../../common/defaults/components/Actor"

// Assemblage is a pattern for creating an entity and component collection as a prototype
const NetworkPlayerCharacter: NetworkAssemblage = {
  components: [{ type: NetworkObject }, { type: Actor }, { type: TransformComponent }],
  localComponents: [{ type: Input }, { type: Camera }]
}

// Assemblage is a pattern for creating an entity and component collection as a prototype
const NetworkCube: NetworkAssemblage = {
  components: [{ type: NetworkObject }, { type: TransformComponent }]
}

// Assemblage is a pattern for creating an entity and component collection as a prototype
const Car: NetworkAssemblage = {
  components: [{ type: NetworkObject }, { type: TransformComponent }]
}

export const AssemblageType = {
  Player: 0,
  Cube: 1,
  Car: 2
}

export const DefaultAssemblages: {
  id: any
  assemblage: NetworkAssemblage
}[] = [
  { id: AssemblageType.Player, assemblage: NetworkPlayerCharacter },
  { id: AssemblageType.Cube, assemblage: NetworkCube },
  { id: AssemblageType.Car, assemblage: Car }
]

export const DefaultNetworkSchema: NetworkSchema = {
  messageHandlers: {
    // TODO: Map message to behavior
    // Transform updates and client initialization!
    // TODO: Move client init from system to here
  },
  assemblages: DefaultAssemblages,
  defaultClientAssemblage: AssemblageType.Player
}
