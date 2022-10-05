import type { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createHyperStore, getState } from '@xrengine/hyperflux'
import { HyperStore } from '@xrengine/hyperflux/functions/StoreFunctions'

import { SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES } from '../../audio/components/PositionalAudioSettingsComponent'
import { NetworkTopics } from '../../networking/classes/Network'
import type { World } from '../classes/World'
import type { SystemModuleType } from '../functions/SystemFunctions'

import '../utils/threejsPatches'

import { EngineState } from './EngineState'

export class Engine {
  static instance: Engine
  tickRate = 60

  /** The uuid of the logged-in user */
  userId: UserId

  store = createHyperStore({
    forwardIncomingActions: (action) => {
      const isHost =
        action.$topic === this.store.defaultTopic
          ? false
          : (action.$topic === NetworkTopics.world ? this.currentWorld.worldNetwork : this.currentWorld.mediaNetwork)
              ?.isHosting
      return isHost || action.$from === this.userId
    },
    getDispatchId: () => Engine.instance.userId,
    getDispatchTime: () => Date.now(),
    defaultDispatchDelay: 1 / this.tickRate
  }) as HyperStore

  audioContext: AudioContext
  cameraGainNode: GainNode

  gainNodeMixBuses = {
    mediaStreams: null! as GainNode,
    notifications: null! as GainNode,
    music: null! as GainNode,
    soundEffects: null! as GainNode
  }

  /** @todo refactor this into hyperflux state */
  spatialAudioSettings = {
    ...SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES
  }

  /**
   * Current frame timestamp, relative to performance.timeOrigin
   */
  get frameTime() {
    return getState(EngineState).frameTime.value
  }

  engineTimer: { start: Function; stop: Function; clear: Function } = null!

  isBot = false

  /**
   * The current world
   */
  currentWorld: World = null!

  /**
   * All worlds that are currently instantiated
   */
  worlds: World[] = []

  publicPath = ''

  xrFrame: XRFrame | null = null

  isEditor = false
}

globalThis.Engine = Engine
