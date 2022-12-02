import { defineState } from '@xrengine/hyperflux'

export type ButtonInputStateType = Record<string, boolean | undefined>

export const ButtonInputState = defineState({
  name: 'ButtonInputState',
  initial: {} as ButtonInputStateType
})
