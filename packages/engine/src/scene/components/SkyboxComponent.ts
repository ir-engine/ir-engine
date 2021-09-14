import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Sky } from '../../scene/classes/Sky'

export type SkyboxComponentType = {
  value: Sky
}

export const SkyboxComponent = createMappedComponent<SkyboxComponentType>('SkyboxComponent')
