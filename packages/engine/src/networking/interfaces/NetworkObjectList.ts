import { NetworkObject } from "../components/NetworkObject";

/** Interface for holding Network Object. */
export interface NetworkObjectList {
  /** Key is network ID. */
  [key: string]: {
    /** Owner's socket ID. */
    ownerId: string;
    /** All network objects need to be a registered prefab. */
    prefabType: string | number;
    /** Container for {@link networking/components/NetworkObject.NetworkObject | NetworkObject} component. */
    component: NetworkObject;
  };
}
