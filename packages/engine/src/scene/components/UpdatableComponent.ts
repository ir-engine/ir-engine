import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export const UpdatableComponent = createMappedComponent<true>('UpdatableComponent')

export const UpdatableCallback = 'xre.update'
