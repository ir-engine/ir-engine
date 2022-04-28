import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export const CameraComponent = createMappedComponent<CameraComponentType>('CameraComponent')

export type CameraComponentType = {
  raycasting: boolean
  rayCount: number
  rayLength: number
  rayFrequency: number
}
