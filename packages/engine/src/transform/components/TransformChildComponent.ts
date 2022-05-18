import { Quaternion, Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TransformChildComponentType = {
  parent: any
  offsetPosition: Vector3
  offsetQuaternion: Quaternion
}

export const TransformChildComponent = createMappedComponent<TransformChildComponentType>('TransformChildComponent')
