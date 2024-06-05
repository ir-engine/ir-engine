import { defineState } from '@etherealengine/hyperflux'

export const ProgressBarState = defineState({
  name: 'ProgressBarState',
  initial: {} as Record<string, JSX.Element>
})
