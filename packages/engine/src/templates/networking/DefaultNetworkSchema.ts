import { MessageTypes } from '../../networking/enums/MessageTypes';
import { NetworkPrefab } from '../../networking/interfaces/NetworkPrefab';
import { NetworkSchema } from '../../networking/interfaces/NetworkSchema';
import { NetworkPlayerCharacter } from '../character/prefabs/NetworkPlayerCharacter';
import { DefaultMessageTypes } from './DefaultMessageTypes';
import { handleClientConnected } from '../../networking/functions/handleClientConnected';
import { handleClientDisconnected } from '../../networking/functions/handleClientDisconnected';

export const PrefabType = {
  Player: 0
};

export const DefaultPrefabs = {
  [PrefabType.Player]: NetworkPlayerCharacter
};

export const DefaultNetworkSchema: NetworkSchema = {
  transport: null,
  messageTypes: {
    ...MessageTypes,
    ...DefaultMessageTypes
  },
  messageHandlers: {
    [MessageTypes.ClientConnected]: [{
      behavior: handleClientConnected
    }],
    [MessageTypes.ClientDisconnected]: [{
      behavior: handleClientDisconnected
    }]
  },
  prefabs: DefaultPrefabs,
  defaultClientPrefab: PrefabType.Player
};
