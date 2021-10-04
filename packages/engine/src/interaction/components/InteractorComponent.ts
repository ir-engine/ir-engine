import { PerspectiveCamera } from 'three'
import { Entity } from '../../ecs/Entity'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type InteractorComponentType = {
  focusedInteractive: Entity
  frustumCamera: PerspectiveCamera
  subFocusedArray: any[]
}

export const InteractorComponent = createMappedComponent<InteractorComponentType>('InteractorComponent')
