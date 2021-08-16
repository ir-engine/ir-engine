import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type IKObjType = {
  ref: any
}

export const IKObj = createMappedComponent<IKObjType>()
