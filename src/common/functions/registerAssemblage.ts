import { World } from "../../ecs/classes/World"
import { Prefab } from "../interfaces/Prefab"
import { hasRegisteredComponent, registerComponent } from "../../ecs"

export function registerPrefab(prefab: Prefab, world: World) {
  prefab.components.forEach((value: { type: any }) => {
    if (!hasRegisteredComponent(value.type)) registerComponent(value.type)
  })
}
