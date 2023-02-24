import matches from 'ts-matches'

import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const SceneAssetPendingTagComponent = defineComponent({
  name: 'SceneAssetPendingTagComponent',

  onInit: (entity) => {
    return { loadedAmount: 0, finishedLoading: false }
  },

  toJSON: () => {
    return null! as any
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.number.test(json.loadedAmount)) component.loadedAmount.set(json.loadedAmount)
    if (matches.boolean.test(json.finishedLoading)) component.finishedLoading.set(json.finishedLoading)
  }
})
