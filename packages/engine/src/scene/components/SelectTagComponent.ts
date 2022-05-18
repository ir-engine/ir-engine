import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SelectTagComponentType = {}

export const SelectTagComponent = createMappedComponent<SelectTagComponentType>('SelectTagComponent')
