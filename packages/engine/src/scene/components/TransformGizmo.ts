import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import TransformGizmo from '../classes/TransformGizmo'

export const TransformGizmoComponent = defineComponent({
  name: 'TransformGizmo',

  onInit(entity) {
    return new TransformGizmo()
  }
})
