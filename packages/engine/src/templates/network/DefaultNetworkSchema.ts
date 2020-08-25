// Components
import { TransformComponent } from '../../transform/components/TransformComponent';
import { DefaultMessageSchema } from './DefaultMessageSchema';
import { DefaultMessageTypes } from './DefaultMessageTypes';
import { NetworkPrefab } from '../../networking/interfaces/NetworkPrefab';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { NetworkSchema } from '../../networking/interfaces/NetworkSchema';
import { MessageTypes } from '../../networking/enums/MessageTypes';
import { handleClientConnected, handleClientDisconnected, handleMessage } from '../../networking/functions/NetworkFunctions';
import { NetworkPlayerCharacter } from '../character/prefabs/NetworkPlayerCharacter';

// initializeCharacterComponent(cube, inputOptions)
// Prefab is a pattern for creating an entity and component collection as a prototype
const NetworkCube: NetworkPrefab = {
  networkComponents: [{ type: NetworkObject }, { type: TransformComponent }]
};

// Prefab is a pattern for creating an entity and component collection as a prototype
const Car: NetworkPrefab = {
  networkComponents: [{ type: NetworkObject }, { type: TransformComponent }]
};

export const PrefabType = {
  Player: 0,
  Cube: 1,
  Car: 2
};

export const DefaultPrefabs: Array<{
  id: any
  prefab: NetworkPrefab
}> = [
  { id: PrefabType.Player, prefab: NetworkPlayerCharacter },
  { id: PrefabType.Cube, prefab: NetworkCube },
  { id: PrefabType.Car, prefab: Car }
];

export const DefaultNetworkSchema: NetworkSchema = {
  transport: null,
  messageHandlers: {
    [MessageTypes.ClientConnected]: {
      behavior: handleClientConnected
    },
    [MessageTypes.ClientDisconnected]: {
      behavior: handleClientDisconnected
    },
    [MessageTypes.ReliableMessage]: {
      behavior: handleMessage
    },
    [MessageTypes.UnreliableMessage]: {
      behavior: handleMessage
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
};
