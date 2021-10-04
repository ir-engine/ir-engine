import { Vector3, Quaternion } from 'three'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type SpawnPoseComponentType = {
  position: Vector3
  rotation: Quaternion
}

export const SpawnPoseComponent = createMappedComponent<SpawnPoseComponentType>('SpawnPoseComponent')
