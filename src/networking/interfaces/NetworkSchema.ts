import { Prefab } from "../../common/interfaces/Prefab"
import PrefabAlias from "../../common/types/PrefabAlias"
import NetworkTransport from "./NetworkTransport"
import MessageSchema from "../classes/MessageSchema"

export default interface NetworkSchema {
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
