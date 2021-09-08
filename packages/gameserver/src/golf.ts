// TODO: this file will be removed when it is moved to the golf repository

import GolfSystem from '@xrengine/client/src/pages/golf/GolfSystem'
import { WebRTCGameServer } from './WebRTCGameServer'
import { start } from './start'

WebRTCGameServer.options.systems.push({
  injectionPoint: 'FIXED',
  system: GolfSystem
})

start()
