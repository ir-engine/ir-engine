import { Engine } from '../../ecs/classes/Engine'
import { UndefinedEntity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const LocalInputTagComponent = defineComponent({
  name: 'LocalInputTagComponent',
  onSet: (entity) => {
    Engine.instance.localClientEntity = entity
  },
  onRemove: (entity) => {
    Engine.instance.localClientEntity = UndefinedEntity
  }
})
