import { Prefab } from "../../common/interfaces/Prefab"
import PrefabAlias from "../../common/types/PrefabAlias"
import NetworkTransport from "./NetworkTransport"

export default interface NetworkSchema {
  transport: any
  messageHandlers: {
    [key: string]: {
      behavior: typeof Function
      args?: any
    }
  }
  defaultClientPrefab: PrefabAlias
  aprefabs: { id: PrefabAlias; aprefab: Prefab }[]
}
