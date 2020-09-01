// Components
import { NetworkObject } from '../../networking/components/NetworkObject';
import { BuiltinMessageTypes } from '../../networking/enums/MessageTypes';
import { NetworkPrefab } from '../../networking/interfaces/NetworkPrefab';
import { NetworkSchema } from '../../networking/interfaces/NetworkSchema';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { NetworkPlayerCharacter } from '../character/prefabs/NetworkPlayerCharacter';
import { DefaultMessageTypes } from './DefaultMessageTypes';


export const PrefabType = {
  Player: 0
};

export const DefaultPrefabs: Array<{
  id: any
  prefab: NetworkPrefab
}> = [
  { id: PrefabType.Player, prefab: NetworkPlayerCharacter }
];

export const DefaultNetworkSchema: NetworkSchema = {
  transport: null,
  messageTypes: {
    ...BuiltinMessageTypes,
    ...DefaultMessageTypes
  },
  messageHandlers: {
  },
  prefabs: DefaultPrefabs,
  defaultClientPrefab: PrefabType.Player
};
