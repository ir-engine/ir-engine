import { Quaternion, Vector3 } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SpawnPoseComponentType = {
  position: Vector3
  rotation: Quaternion
}

export const SpawnPoseComponent = createMappedComponent<SpawnPoseComponentType>('SpawnPoseComponent')
