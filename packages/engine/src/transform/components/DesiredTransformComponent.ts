import { Vector3, Quaternion } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type DesiredTransformComponentType = {
  position: Vector3
  rotation: Quaternion
  positionRate: number
  rotationRate: number
  lockRotationAxis: [boolean, boolean, boolean]
}

export const DesiredTransformComponent =
  createMappedComponent<DesiredTransformComponentType>('DesiredTransformComponent')
