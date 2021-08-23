// TODO: this file will be removed when it is moved to the golf repository

import { GolfSystem } from '@xrengine/client/src/pages/golf/GolfSystem'
import { WebRTCGameServer } from './WebRTCGameServer'
import { start } from './start'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { EquippableSystem } from '@xrengine/engine/src/interaction/systems/EquippableSystem'

WebRTCGameServer.options.systems.push({
  type: SystemUpdateType.Fixed,
  system: GolfSystem,
  after: EquippableSystem
})

start()
