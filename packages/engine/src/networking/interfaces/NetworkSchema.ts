import { Prefab } from '../../common/interfaces/Prefab';
import { PrefabAlias } from '../../common/types/PrefabAlias';
import { MessageSchema } from '../classes/MessageSchema';

export interface NetworkSchema {
  transport: any
  messageTypes: {
    [key: string]: any
  }
  messageHandlers: {
    [key: string]: {
      behavior: any
      args?: any
    }
  }
  defaultClientPrefab: PrefabAlias
  prefabs: Array<{ id: PrefabAlias, prefab: Prefab }>
}
