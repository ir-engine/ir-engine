import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type NameComponentType = {
  name: string
}

export const NameComponent = createMappedComponent<NameComponentType>('NameComponent')
