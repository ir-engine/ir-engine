import { Prefab } from '../../common/interfaces/Prefab';

/** Interface for network component. */
interface NetworkComponentInterface {
  /** Type of the component. */
  type: any;
  /** Data of the component. */
  data?: any;
  /** Network attributes. */
  networkedAttributes?: {
    /** Key is name of network attribute. */
    [key: string]: any;
  };
}

/** Interface for Network prefab. */
export interface NetworkPrefab extends Prefab {
  /** List of network components. */
  networkComponents: Array<NetworkComponentInterface>;
  /** List of server components. */
  serverComponents: Array<NetworkComponentInterface>;
}
