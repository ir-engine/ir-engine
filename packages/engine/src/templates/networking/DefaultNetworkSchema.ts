import { MessageTypes } from '../../networking/enums/MessageTypes';
import { NetworkSchema } from '../../networking/interfaces/NetworkSchema';
import { NetworkPlayerCharacter } from '../character/prefabs/NetworkPlayerCharacter';
import { NetworkVehicle } from '../vehicle/prefabs/NetworkVehicle';
import { NetworkPrefab } from '../../networking/interfaces/NetworkPrefab';
import { TransformComponent } from '../../transform/components/TransformComponent';

// Prefab is a pattern for creating an entity and component collection as a prototype
export const NetworkWorldObject: NetworkPrefab = {
  // These will be created for all players on the network
  networkComponents: [
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent }
    // Local player input mapped to behaviors in the input map
  ],
  // These are only created for the local player who owns this prefab
  localClientComponents: [],
  serverComponents: [],
  onAfterCreate: [],
  onBeforeDestroy: []
};

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
    ...MessageTypes
  },
  prefabs: DefaultPrefabs,
  defaultClientPrefab: PrefabType.Player
};
