import { MessageTypes } from '../../networking/enums/MessageTypes';
import { NetworkSchema } from '../../networking/interfaces/NetworkSchema';
import { NetworkPlayerCharacter } from '../character/prefabs/NetworkPlayerCharacter';
import { NetworkRigidBody } from '../interactive/prefabs/NetworkRigidBody';
import { NetworkVehicle } from '../vehicle/prefabs/NetworkVehicle';

export const PrefabType = {
  Player: 0,
  RigidBody: 1,
  Vehicle: 2
};

export const DefaultPrefabs = {
  [PrefabType.Player]: NetworkPlayerCharacter,
  [PrefabType.RigidBody]: NetworkRigidBody,
  [PrefabType.Vehicle]: NetworkVehicle
};

export const DefaultNetworkSchema: NetworkSchema = {
  transport: null,
  messageTypes: {
    ...MessageTypes
  },
  prefabs: DefaultPrefabs,
  defaultClientPrefab: PrefabType.Player
};
