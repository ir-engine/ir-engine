import { createState } from '@etherealengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const SceneAssetPendingTagComponent = defineComponent({
  name: 'SceneAssetPendingTagComponent',

  loadingProgress: createState(
    {} as Record<
      Entity,
      {
        loadedAmount: number
        totalAmount: number
      }
    >
  )
})
