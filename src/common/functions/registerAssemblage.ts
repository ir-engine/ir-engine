import { World } from "ecsy"
import { Assemblage } from "../interfaces/Assemblage"

export function registerAssemblage(assemblage: Assemblage, world: World) {
  assemblage.components.forEach((value: { type: any }) => {
    if (!world.hasRegisteredComponent(value.type)) world.registerComponent(value.type)
  })
}
