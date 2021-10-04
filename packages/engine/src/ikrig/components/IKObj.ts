import { SkinnedMesh } from 'three'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

type IKObjType = {
  ref: SkinnedMesh
}

export const IKObj = createMappedComponent<IKObjType>('IKObj')
