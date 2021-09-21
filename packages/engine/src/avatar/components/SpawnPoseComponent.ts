import { Vector3, Quaternion } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SpawnPoseComponentType = {
  position: Vector3
  rotation: Quaternion
}

export const SpawnPoseComponent = createMappedComponent<SpawnPoseComponentType>('SpawnPoseComponent')
