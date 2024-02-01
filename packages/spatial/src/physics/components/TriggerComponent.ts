import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { defineComponent } from '@etherealengine/ecs'

export const TriggerComponent = defineComponent({
  name: 'TriggerComponent',
  jsonID: 'ee_trigger',

  onInit(entity) {
    return {
      triggers: [] as Array<{
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
         */
        onEnter: null | string
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is exited.
         */
        onExit: null | string
        /**
         * empty string represents self
         */
        target: null | EntityUUID
      }>
    }
  }
})
