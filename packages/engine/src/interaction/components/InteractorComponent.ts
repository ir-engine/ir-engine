import { PerspectiveCamera } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type InteractorComponentType = {
  focusedInteractive: Entity
  frustumCamera: PerspectiveCamera
  subFocusedArray: any[]
}

export const InteractorComponent = createMappedComponent<InteractorComponentType>()
