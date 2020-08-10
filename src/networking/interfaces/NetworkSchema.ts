import { Prefab } from "../../common/interfaces/Prefab"
import { PrefabAlias } from "../../common/types/PrefabAlias"
import { MessageSchema } from "../classes/MessageSchema"
import { NetworkTransport } from "./NetworkTransport"

export interface NetworkSchema {
  transport: NetworkTransport | unknown | null
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
