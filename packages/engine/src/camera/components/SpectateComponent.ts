import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SpectateComponentType = {}
export const SpectateComponent = createMappedComponent<SpectateComponentType>('SpectateComponent')
