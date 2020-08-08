// Components
import NetworkSchema from "../interfaces/NetworkSchema"
import NetworkObject from "../components/NetworkObject"
import { NetworkPrefab } from "../interfaces/NetworkPrefab"
import Input from "../../input/components/Input"
import Transform from "../../transform/components/Transform"
import Camera from "../../camera/components/Camera"
import Actor from "../../common/defaults/components/Actor"
import { addObject3DComponent, removeObject3DComponent } from "../../common/defaults/behaviors/Object3DBehaviors"
import { Mesh, BoxBufferGeometry, MeshBasicMaterial } from "three"
import { Transport } from "mediasoup-client/lib/types"
import { SocketWebRTCClientTransport } from "../transports/SocketWebRTC/SocketWebRTCClientTransport"

// Prefab is a pattern for creating an entity and component collection as a prototype
const NetworkPlayerCharacter: NetworkPrefab = {
  components: [{ type: NetworkObject }, { type: Actor }, { type: Transform }],
  localComponents: [{ type: Input }, { type: Camera }],
  onCreate: [
    {
      behavior: addObject3DComponent,
      args: {
        obj: new Mesh(new BoxBufferGeometry(1, 1, 1), new MeshBasicMaterial({}))
      }
    }
  ],
  onDestroy: [
    {
      behavior: removeObject3DComponent
    }
  ]
}

// initializeActor(cube, inputOptions)
// Prefab is a pattern for creating an entity and component collection as a prototype
const NetworkCube: NetworkPrefab = {
  components: [{ type: NetworkObject }, { type: Transform }]
}

// Prefab is a pattern for creating an entity and component collection as a prototype
const Car: NetworkPrefab = {
  components: [{ type: NetworkObject }, { type: Transform }]
}

export const PrefabType = {
  Player: 0,
  Cube: 1,
  Car: 2
}

export const DefaultPrefabs: {
  id: any
  aprefab: NetworkPrefab
}[] = [
  { id: PrefabType.Player, aprefab: NetworkPlayerCharacter },
  { id: PrefabType.Cube, aprefab: NetworkCube },
  { id: PrefabType.Car, aprefab: Car }
]

export const DefaultNetworkSchema: NetworkSchema = {
  transport: SocketWebRTCClientTransport,
  messageHandlers: {
    // TODO: Map message to behavior
    // Transform updates and client initialization!
    // TODO: Move client init from system to here
  },
  aprefabs: DefaultPrefabs,
  defaultClientPrefab: PrefabType.Player
}
