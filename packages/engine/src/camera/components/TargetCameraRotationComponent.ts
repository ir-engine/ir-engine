import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type TargetCameraRotationComponentType = {
  /** Rotation around Y axis */
  theta: number
  /** Rotation around Z axis */
  phi: number
  /** Time to reach the target */
  time: number
  phiVelocity: { value: number }
  thetaVelocity: { value: number }
}

export const TargetCameraRotationComponent = createMappedComponent<TargetCameraRotationComponentType>(
  'TargetCameraRotationComponent'
)
