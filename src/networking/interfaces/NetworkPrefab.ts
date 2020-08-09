import { Prefab } from "../../common/interfaces/Prefab";

export interface NetworkPrefab extends Prefab {
  localComponents?: {
    type: any
    data?: any
  }[]
}
