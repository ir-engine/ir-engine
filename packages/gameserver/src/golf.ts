// TODO: this file will be removed when it is moved to the golf repository

import { GolfSystem } from '@xrengine/engine/src/game/templates/Golf/GolfSystem'
import { WebRTCGameServer } from './WebRTCGameServer'
import { start } from './start'

WebRTCGameServer.options.systems
  .push
  // TODO: we need to register this still in WebRTCGameServer as this is not currently set up to work in deploy
  // {
  //   system: GolfSystem,
  //   args: { priority: 6 }
  // }
  ()

start()
