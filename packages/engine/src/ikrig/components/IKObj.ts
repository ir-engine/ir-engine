import { SkinnedMesh } from 'three'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type IKObjType = {
  ref?: SkinnedMesh | null
}

export const IKObj = createMappedComponent<IKObjType>()
