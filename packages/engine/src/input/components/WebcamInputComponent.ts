import { Types } from 'bitecs'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export type WebcamInputComponentType = {
  expressionValue: number
  expressionIndex: number
}

export const WebcamInputComponent = defineComponent({
  name: 'WebcamInputComponent',

  schema: {
    expressionValue: Types.f32,
    expressionIndex: Types.ui8
  },

  onInit(entity) {
    return {
      expressionValue: 0,
      expressionIndex: 0
    }
  }
})
