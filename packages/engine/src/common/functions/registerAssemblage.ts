import { Engine } from "../../ecs/classes/Engine"
import { Prefab } from "../interfaces/Prefab"
import { hasRegisteredComponent, registerComponent } from "../../ecs/functions/ComponentFunctions"

export function registerPrefab(prefab: Prefab, world: Engine) {
  prefab.components.forEach((value: { type: any }) => {
    if (!hasRegisteredComponent(value.type)) registerComponent(value.type)
  })
}
