import { applyIncomingActions } from '@etherealengine/hyperflux'

import { defineSystem } from '../../ecs/functions/SystemFunctions'

const execute = () => {
  applyIncomingActions()
}

export const IncomingActionSystem = defineSystem({
  uuid: 'ee.engine.IncomingActionSystem',
  execute
})
