import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import TransformGizmo from '../classes/TransformGizmo'

export const TransformGizmoComponent = createMappedComponent<{ gizmo: TransformGizmo }>('TransformGizmo')
