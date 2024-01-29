import { defineState } from '@etherealengine/hyperflux'

export const SDFSettingsState = defineState({
  name: 'SDFSettingsState',
  initial: {
    enabled: true
  }
})
