import { createMappedComponent } from "../../ecs/functions/EntityFunctions"

type VolumetricVideoComponentType = {
  player: any
}

export const VolumetricComponent = createMappedComponent<VolumetricVideoComponentType>()