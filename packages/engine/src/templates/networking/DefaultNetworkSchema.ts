import { MessageTypes } from '../../networking/enums/MessageTypes';
import { NetworkSchema } from '../../networking/interfaces/NetworkSchema';
import { NetworkPlayerCharacter } from '../character/prefabs/NetworkPlayerCharacter';
import { NetworkWorldObject } from '../world/prefabs/NetworkWorldObject';
import { NetworkVehicle } from '../car/prefabs/NetworkVehicle';
import { DefaultMessageTypes } from './DefaultMessageTypes';

export const PrefabType = {
  Player: 0,
  worldObject: 1,
  Vehicle: 2
};

export const DefaultPrefabs = {
  [PrefabType.Player]: NetworkPlayerCharacter,
  [PrefabType.worldObject]: NetworkWorldObject,
  [PrefabType.Vehicle]: NetworkVehicle,
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
