import { World } from "ecsy"
import { Prefab } from "../interfaces/Prefab"

export function registerPrefab(aprefab: Prefab, world: World) {
  aprefab.components.forEach((value: { type: any }) => {
    if (!world.hasRegisteredComponent(value.type)) world.registerComponent(value.type)
  })
}
