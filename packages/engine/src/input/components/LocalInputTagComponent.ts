import { Engine } from '../../ecs/classes/Engine'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const LocalInputTagComponent = defineComponent({
  name: 'LocalInputTagComponent',
  onSet: (entity) => {
    Engine.instance.localClientEntity = entity
  }
})
