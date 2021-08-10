import { createMappedComponent } from '../../ecs/functions/EntityFunctions'
import { Sky } from '../../scene/classes/Sky'

export type SkyboxComponentType = {
  value: Sky
}

export const SkyboxComponent = createMappedComponent<SkyboxComponentType>()
