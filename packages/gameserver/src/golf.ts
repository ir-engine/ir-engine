// TODO: this file will be removed when it is moved to the golf repository

import { GameManagerSystem } from '@xrengine/engine/src/game/systems/GameManagerSystem'
import { WebRTCGameServer } from './WebRTCGameServer'
import { start } from './start'

WebRTCGameServer.options.systems
  .push
  // TODO: we need to register this still in WebRTCGameServer as this is not currently set up to work in deploy
  // {
  //   system: GolfSystem,
  //   after: GameManagerSystem
  // }
  ()

start()
