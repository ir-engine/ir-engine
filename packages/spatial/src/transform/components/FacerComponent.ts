import { EntityUUID, defineComponent } from '@etherealengine/ecs'
import { matches } from '@etherealengine/hyperflux'
export const FacerComponent = defineComponent({
  name: 'FacerComponent',
  jsonID: 'IR_facer',
  onInit: (entity) => ({
    target: null as EntityUUID | null
  }),
  onSet: (entity, component, props) => {
    if (matches.string.test(props?.target)) {
      component.target.set(props.target)
    }
  },
  toJSON: (entity, component) => ({
    target: component.target.value
  })
})
