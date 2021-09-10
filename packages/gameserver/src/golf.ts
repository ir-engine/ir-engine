// TODO: this file will be removed when it is moved to the golf repository

import { WebRTCGameServer } from './WebRTCGameServer'
import { start } from './start'

WebRTCGameServer.options.systems.push({
  injectionPoint: 'FIXED',
  system: import('@xrengine/client/src/pages/golf/GolfSystem')
})

start()
