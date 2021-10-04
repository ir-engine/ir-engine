import { createMappedComponent } from '../../ecs/ComponentFunctions'
import { Sky } from '../../scene/classes/Sky'

export type SkyboxComponentType = {
  value: Sky
}

export const SkyboxComponent = createMappedComponent<SkyboxComponentType>('SkyboxComponent')
