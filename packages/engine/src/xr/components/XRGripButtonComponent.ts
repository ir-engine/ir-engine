import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type XRGripButtonComponentType = {}

export const XRLGripButtonComponent = createMappedComponent<XRGripButtonComponentType>('XRLGripButtonComponent')
export const XRRGripButtonComponent = createMappedComponent<XRGripButtonComponentType>('XRRGripButtonComponent')
