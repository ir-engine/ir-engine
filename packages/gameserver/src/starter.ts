import { WebRTCGameServer } from './WebRTCGameServer'
import { start } from './start'

WebRTCGameServer.options.systems.push({
  injectionPoint: 'FIXED',
  system: import('@xrengine/client/src/pages/starter/StarterGameSystem')
})

start()
