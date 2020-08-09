import { BehaviorValue } from "./BehaviorValue";

// Prefab is a pattern for creating an entity and component collection as a prototype
export interface Prefab {
  components: {
    type: any
    data?: any
  }[]
  onCreate?: BehaviorValue[]
  onDestroy?: BehaviorValue[]
}
