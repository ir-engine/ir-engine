/* eslint-disable @typescript-eslint/ban-ts-comment */
import { API } from '@etherealengine/client-core/src/API'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { initializeBrowser } from '@etherealengine/engine/src/initializeBrowser'
import { createEngine } from '@etherealengine/engine/src/initializeEngine'
import { getMutableState } from '@etherealengine/hyperflux'

import { initializei18n } from './util'

createEngine()
getMutableState(EngineState).publicPath.set(
  // @ts-ignore
  import.meta.env.BASE_URL === '/client/' ? location.origin : import.meta.env.BASE_URL!.slice(0, -1) // remove trailing '/'
)
initializei18n()
initializeBrowser()
API.createAPI()

export default function ({ children }) {
  return children
}
