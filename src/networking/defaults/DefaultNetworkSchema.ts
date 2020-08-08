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
import DefaultMessageTypes from "./DefaultMessageTypes"
import MessageTypes from "../enums/MessageTypes"
import { handleClientConnected, handleClientDisconnected, handleReliableMessage, handleUnreliableMessage } from "../behaviors/NetworkBehaviors"
import DefaultMessageSchema from "./DefaultMessageSchema"

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
  prefab: NetworkPrefab
}[] = [
  { id: PrefabType.Player, prefab: NetworkPlayerCharacter },
  { id: PrefabType.Cube, prefab: NetworkCube },
  { id: PrefabType.Car, prefab: Car }
]

export const DefaultNetworkSchema: NetworkSchema = {
  transport: SocketWebRTCClientTransport,
  messageHandlers: {
    [MessageTypes.ClientConnected]: {
      behavior: handleClientConnected
    },
    [MessageTypes.ClientDisconnected]: {
      behavior: handleClientDisconnected
    },
    [MessageTypes.ReliableMessage]: {
      behavior: handleReliableMessage
    },
    [MessageTypes.UnreliableMessage]: {
      behavior: handleUnreliableMessage
    }
  },
  messageSchemas: {
    [DefaultMessageTypes.Clock]: DefaultMessageSchema.Clock,
    [DefaultMessageTypes.World]: DefaultMessageSchema.World,
    [DefaultMessageTypes.Position]: DefaultMessageSchema.Position,
    [DefaultMessageTypes.Velocity]: DefaultMessageSchema.Velocity,
    [DefaultMessageTypes.Spin]: DefaultMessageSchema.Spin,
    [DefaultMessageTypes.Rotation]: DefaultMessageSchema.Rotation,
    [DefaultMessageTypes.Scale]: DefaultMessageSchema.Scale,
    [DefaultMessageTypes.Client]: DefaultMessageSchema.Client,
    [DefaultMessageTypes.Object]: DefaultMessageSchema.Object
  },
  prefabs: DefaultPrefabs,
  defaultClientPrefab: PrefabType.Player
}
