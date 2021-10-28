import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type NameComponentType = {
  name: string
}

export const NameComponent = createMappedComponent<NameComponentType>(ComponentNames.NAME)
