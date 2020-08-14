import { Prefab } from "../interfaces/Prefab"
import { World } from "../../ecs/classes/World"

export function registerPrefab(prefab: Prefab, world: World) {
  prefab.components.forEach((value: { type: any }) => {
    if (!hasRegisteredComponent(value.type)) world.registerComponent(value.type)
  })
}
