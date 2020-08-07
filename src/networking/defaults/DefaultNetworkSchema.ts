// Components
import NetworkSchema from "../interfaces/NetworkSchema"
import NetworkObject from "../components/NetworkObject"
import { NetworkAssemblage } from "../interfaces/NetworkAssemblage"
import Input from "../../input/components/Input"
import Transform from "../../transform/components/Transform"
import Camera from "../../camera/components/Camera"
import Actor from "../../common/defaults/components/Actor"

// Assemblage is a pattern for creating an entity and component collection as a prototype
const NetworkPlayerCharacter: NetworkAssemblage = {
  components: [{ type: NetworkObject }, { type: Actor }, { type: Transform }],
  localComponents: [{ type: Input }, { type: Camera }]
}

// Assemblage is a pattern for creating an entity and component collection as a prototype
const NetworkCube: NetworkAssemblage = {
  components: [{ type: NetworkObject }, { type: Transform }]
}

// Assemblage is a pattern for creating an entity and component collection as a prototype
const Car: NetworkAssemblage = {
  components: [{ type: NetworkObject }, { type: Transform }]
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

const cube = world
.createEntity()
.addObject3DComponent(
  new Mesh(
    new BoxBufferGeometry(1, 1, 1),
    new MeshBasicMaterial({
    })
  ),
  sceneEntity
)
initializeActor(cube, inputOptions)

export const DefaultNetworkSchema: NetworkSchema = {
  messageHandlers: {
    // TODO: Map message to behavior
    // Transform updates and client initialization!
    // TODO: Move client init from system to here
  },
  assemblages: DefaultAssemblages,
  defaultClientAssemblage: AssemblageType.Player
}
