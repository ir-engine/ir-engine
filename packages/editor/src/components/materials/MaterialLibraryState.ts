import { defineState } from '@etherealengine/hyperflux'

export const MaterialSelectionState = defineState({
  name: 'MaterialSelectionState',
  initial: {
    selectedMaterial: null as string | null
  }
})
