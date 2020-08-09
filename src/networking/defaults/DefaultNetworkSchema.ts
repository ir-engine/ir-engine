// Components
import { BoxBufferGeometry, Mesh, MeshBasicMaterial } from "three"
import { Camera } from "../../camera/components/Camera"
import { addObject3DComponent, removeObject3DComponent } from "../../common/defaults/behaviors/Object3DBehaviors"
import { Actor } from "../../common/defaults/components/Actor"
import { Input } from "../../input/components/Input"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { handleClientConnected, handleClientDisconnected, handleReliableMessage, handleUnreliableMessage } from "../behaviors/NetworkBehaviors"
import { NetworkObject } from "../components/NetworkObject"
import { MessageTypes } from "../enums/MessageTypes"
import { NetworkPrefab } from "../interfaces/NetworkPrefab"
import { NetworkSchema } from "../interfaces/NetworkSchema"
import { SocketWebRTCClientTransport } from "../transports/SocketWebRTC/SocketWebRTCClientTransport"
import { DefaultMessageSchema } from "./DefaultMessageSchema"
import { DefaultMessageTypes } from "./DefaultMessageTypes"

// Prefab is a pattern for creating an entity and component collection as a prototype
const NetworkPlayerCharacter: NetworkPrefab = {
  components: [{ type: NetworkObject }, { type: Actor }, { type: TransformComponent }],
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
  components: [{ type: NetworkObject }, { type: TransformComponent }]
}

// Prefab is a pattern for creating an entity and component collection as a prototype
const Car: NetworkPrefab = {
  components: [{ type: NetworkObject }, { type: TransformComponent }]
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
