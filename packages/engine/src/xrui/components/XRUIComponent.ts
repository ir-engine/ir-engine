import { WebContainer3D } from '@etherealjs/web-layer/three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type XRUIComponentType = {
  container: WebContainer3D
}

export const XRUIComponent = createMappedComponent<XRUIComponentType>('XRUIComponent')
