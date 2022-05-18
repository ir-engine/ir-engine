import { XRFrame } from 'three'

import type { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createHyperStore } from '@xrengine/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import type { World } from '../classes/World'
import type { SystemModuleType } from '../functions/SystemFunctions'

export class Engine {
  static instance: Engine

  /** Systems to inject after core systems */
  injectedSystems: SystemModuleType<any>[] = []

  /** The uuid of the logged-in user */
  userId: UserId

  store = createHyperStore({
    name: 'ENGINE',
    getDispatchId: () => 'engine',
    getDispatchTime: () => Engine.instance.frameTime
  })

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
