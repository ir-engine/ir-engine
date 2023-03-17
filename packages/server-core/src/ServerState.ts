import { defineState } from '@etherealengine/hyperflux'

import { Application } from '../declarations'

export const ServerState = defineState({
  name: 'ServerState',
  initial: {
    app: null! as Application
  }
})
