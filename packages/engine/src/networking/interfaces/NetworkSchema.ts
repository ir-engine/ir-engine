import { Prefab } from "../../common/interfaces/Prefab"
import { PrefabAlias } from "../../common/types/PrefabAlias"
import { MessageSchema } from "../classes/MessageSchema"

export interface NetworkSchema {
  transport: any
  messageSchemas: {
    [key: string]: MessageSchema<any>
    [key: number]: MessageSchema<any>
  }
  messageHandlers: {
    [key: string]: {
      behavior: any
      args?: any
    }
  }
  defaultClientPrefab: PrefabAlias
  prefabs: { id: PrefabAlias; prefab: Prefab }[]
}
