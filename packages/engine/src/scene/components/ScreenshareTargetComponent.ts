import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const ScreenshareTargetComponent = defineComponent({
  name: 'ScreenshareTargetComponent',
  jsonID: 'screensharetarget',
  toJSON: () => true
})
