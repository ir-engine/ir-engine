import { NetworkPrefab } from './NetworkPrefab';

export interface NetworkSchema {
  transport: any;
  messageTypes: {
    [key: string]: any;
  };
  defaultClientPrefab: string | number;
  prefabs: {
    [key: string]: NetworkPrefab;
  };
}
