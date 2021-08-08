import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type ShadowComponentType = {
  castShadow: boolean
  receiveShadow: boolean
}

export const ShadowComponent = createMappedComponent<ShadowComponentType>()