import { NetworkObject } from "../components/NetworkObject";

export interface NetworkObjectList {
  // Key is networkId
  [key: string]: {
    ownerId: string; // Owner's socket ID
    prefabType: number; // All network objects need to be a registered prefab
    component: NetworkObject;
  };
}
