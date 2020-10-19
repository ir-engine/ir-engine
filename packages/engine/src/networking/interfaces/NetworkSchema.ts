import { PrefabAlias } from '../../common/types/PrefabAlias';
import { NetworkPrefab } from './NetworkPrefab';

export interface NetworkSchema {
  transport: any;
  messageTypes: {
    [key: string]: any;
  };
  messageHandlers: {
    [key: string]: {
      behavior: any;
      args?: any;
    }[];
  };
  defaultClientPrefab: PrefabAlias;
  prefabs: {
    [key: string]: NetworkPrefab;
  };
}
