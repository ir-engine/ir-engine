import { WebLayer3D } from 'ethereal'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type XRUIComponentType = {
  layer: WebLayer3D
}

export const XRUIComponent = createMappedComponent<XRUIComponentType>('XRUIComponent')
