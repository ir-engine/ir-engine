import { MessageTypes } from '../../networking/enums/MessageTypes';
import { NetworkSchema } from '../../networking/interfaces/NetworkSchema';
import { NetworkPlayerCharacter } from '../character/prefabs/NetworkPlayerCharacter';
import { DefaultMessageTypes } from './DefaultMessageTypes';

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
  prefabs: DefaultPrefabs,
  defaultClientPrefab: PrefabType.Player
};
