import { XRFrame } from 'three'

import type { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createHyperStore } from '@xrengine/hyperflux'
import { HyperStore } from '@xrengine/hyperflux/functions/StoreFunctions'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import type { World } from '../classes/World'
import type { SystemModuleType } from '../functions/SystemFunctions'

import '../utils/threejsPatches'

export class Engine {
  static instance: Engine
  tickRate = 60

  /** Systems to inject after core systems */
  injectedSystems: SystemModuleType<any>[] = []

  /** The uuid of the logged-in user */
  userId: UserId

  store = createHyperStore({
    getDispatchMode: (topic: string) =>
      topic === this.store.defaultTopic ? 'local' : this.currentWorld.networks.get(topic)!.isHosting ? 'host' : 'peer',
    getDispatchId: () => Engine.instance.userId,
    getDispatchTime: () => Date.now(),
    defaultDispatchDelay: 1 / this.tickRate
  }) as HyperStore

  /**
   * Current frame timestamp, relative to performance.timeOrigin
   */
  frameTime = nowMilliseconds()

  engineTimer: { start: Function; stop: Function; clear: Function } = null!

  isBot = false

  isHMD = false

  /**
   * The current world
   */
  currentWorld: World = null!

  /**
   * All worlds that are currently instantiated
   */
  worlds: World[] = []

  publicPath: string = null!

  simpleMaterials = false
  xrFrame: XRFrame

  isEditor = false
}

globalThis.Engine = Engine
