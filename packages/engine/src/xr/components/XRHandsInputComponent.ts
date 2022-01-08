import { Group } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type XRHandsInputComponentType = {
  /**
   * @property {Group} hands
   * Hand controllers
   */
  hands: Group[]
}

export const XRHandsInputComponent = createMappedComponent<XRHandsInputComponentType>('XRHandsInputComponent')
