import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type ShadowComponentType = {
  castShadow: boolean
  receiveShadow: boolean
}

export const ShadowComponent = createMappedComponent<ShadowComponentType>('ShadowComponent')
