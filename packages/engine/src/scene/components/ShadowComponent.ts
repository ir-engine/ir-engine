import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type ShadowComponentType = {
  castShadow: boolean
  receiveShadow: boolean
}

export const ShadowComponent = createMappedComponent<ShadowComponentType>()
