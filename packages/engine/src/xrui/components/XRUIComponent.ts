import { WebLayer3D } from 'ethereal'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type XRUIComponent = {
  layer: WebLayer3D
}

export const XRUIComponent = createMappedComponent<XRUIComponent>()
