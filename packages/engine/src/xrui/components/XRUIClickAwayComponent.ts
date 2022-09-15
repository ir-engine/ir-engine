import { WebContainer3D } from '@etherealjs/web-layer/three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type XRUIClickAwayComponentType = {
  onClickAway: (hit: ReturnType<typeof WebContainer3D.prototype.hitTest>) => void
}

export const XRUIClickAwayComponent = createMappedComponent<XRUIClickAwayComponentType>('XRUIClickAwayComponent')
