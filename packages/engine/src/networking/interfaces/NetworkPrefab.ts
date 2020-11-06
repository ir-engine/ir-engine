import { Prefab } from '../../common/interfaces/Prefab';

export interface NetworkPrefab extends Prefab {
  networkComponents: Array<{
    type: any;
    data?: any;
    networkedAttributes?: {
      [key: string]: any;
    };
  }>;
}
