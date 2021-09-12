import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

type IKObjType = {
  ref?: any
}

export const IKObj = createMappedComponent<IKObjType>('IKObj')
