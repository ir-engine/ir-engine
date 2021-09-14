import { SkinnedMesh } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

type IKObjType = {
  ref?: SkinnedMesh | null
}

export const IKObj = createMappedComponent<IKObjType>('IKObj')
