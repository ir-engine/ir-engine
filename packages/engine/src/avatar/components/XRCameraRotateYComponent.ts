import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type XRCameraRotateYComponentType = {
  angle: number
}

export const XRCameraRotateYComponent = createMappedComponent<XRCameraRotateYComponentType>('XRCameraRotateYComponent')
