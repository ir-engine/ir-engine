import { PerspectiveCamera } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type InteractorComponentType = {
  focusedInteractive: Entity | null
  frustumCamera: PerspectiveCamera
  subFocusedArray: Entity[]
}

export const InteractorComponent = createMappedComponent<InteractorComponentType>('InteractorComponent')
