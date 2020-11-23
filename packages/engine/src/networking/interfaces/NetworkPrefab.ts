import { Prefab } from '../../common/interfaces/Prefab';

interface NetworkComponentInterface {
  type: any;
  data?: any;
  networkedAttributes?: {
    [key: string]: any;
  };
}
export interface NetworkPrefab extends Prefab {
  networkComponents: Array<NetworkComponentInterface>;
  serverComponents: Array<NetworkComponentInterface>;
}
