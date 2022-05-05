import { AudioListener, Object3D, OrthographicCamera, PerspectiveCamera, Scene, XRFrame } from 'three'

import type { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createHyperStore } from '@xrengine/hyperflux'

import type { InputValue } from '../../input/interfaces/InputValue'
import type { World } from '../classes/World'
import type { Entity } from './Entity'

export class Engine {
  static instance: Engine

  /** The uuid of the logged-in user */
  userId: UserId

  store = createHyperStore({
    name: 'ENGINE',
    getDispatchId: () => 'engine',
    getDispatchTime: () => Engine.instance.elapsedTime
  })

  elapsedTime = 0

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

  /**
   * Reference to the three.js scene object.
   */
  scene: Scene = null!

  /**
   * Map of object lists by layer
   * (automatically updated by the SceneObjectSystem)
   */
  objectLayerList = {} as { [layer: number]: Set<Object3D> }

  /**
   * Reference to the three.js perspective camera object.
   */
  camera: PerspectiveCamera | OrthographicCamera = null!
  activeCameraEntity: Entity = null!
  activeCameraFollowTarget: Entity | null = null

  /**
   * Reference to the audioListener.
   * This is a virtual listner for all positional and non-positional audio.
   */
  audioListener: AudioListener = null!

  inputState = new Map<any, InputValue>()
  prevInputState = new Map<any, InputValue>()

  publicPath: string = null!

  simpleMaterials = false
  xrFrame: XRFrame

  isEditor = false
}

globalThis.Engine = Engine
