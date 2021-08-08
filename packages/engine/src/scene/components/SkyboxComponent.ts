import { createMappedComponent } from '../../ecs/functions/EntityFunctions'
import { Sky } from '../../scene/classes/Sky'

type SkyboxComponentType = {
  value: Sky
}

export const SkyboxComponent = createMappedComponent<SkyboxComponentType>()