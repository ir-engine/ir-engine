import { World } from "ecsy"
import { Prefab } from "../interfaces/Prefab"

export function registerPrefab(prefab: Prefab, world: World) {
  prefab.components.forEach((value: { type: any }) => {
    if (!world.hasRegisteredComponent(value.type)) world.registerComponent(value.type)
  })
}
