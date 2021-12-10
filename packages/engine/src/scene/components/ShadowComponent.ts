import { ComponentName } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ShadowComponentType = {
  castShadow: boolean
  receiveShadow: boolean
}

export const ShadowComponent = createMappedComponent<ShadowComponentType>(ComponentName.SHADOW)
