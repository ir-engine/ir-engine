import { addComponent, defineComponent } from '../../ecs/functions/ComponentFunctions'
import { Water } from '../classes/Water'
import { setCallback } from './CallbackComponent'
import { addObjectToGroup } from './GroupComponent'
import { UpdatableCallback, UpdatableComponent } from './UpdatableComponent'

export const WaterComponent = defineComponent({
  name: 'WaterComponent',

  onInit(entity) {
    const water = new Water()
    addObjectToGroup(entity, water)
    setCallback(entity, UpdatableCallback, (dt: number) => {
      water.update(dt)
    })
    addComponent(entity, UpdatableComponent, true)
    return water
  },

  toJSON(entity, component) {
    return true
  }
})

export const SCENE_COMPONENT_WATER = 'water'
