import { defineState } from '@etherealengine/hyperflux'

export const EditorErrorState = defineState({
  name: 'EditorErrorState',
  initial: { error: null as string | null }
})
