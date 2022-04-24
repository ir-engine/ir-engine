/**
 * This file constains declaration of Engine Class.
 *
 * @author Fernando Serrano, Robert Long
 * @packageDocumentation
 */
import {
  AudioListener,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  WebXRManager,
  XRFrame,
  XRSession
} from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createHyperStore } from '@xrengine/hyperflux'

import { CSM } from '../../assets/csm/CSM'
import { isBot } from '../../common/functions/isBot'
import { InputValue } from '../../input/interfaces/InputValue'
import { EffectComposerWithSchema } from '../../renderer/WebGLRendererSystem'
import { World } from '../classes/World'
import { accessEngineState } from './EngineService'
import { Entity } from './Entity'

/**
 * This is the base class which holds all the data related to the scene, camera,system etc.
 * Data is holded statically hence will be available everywhere.
 *
 * @author Josh, Vyacheslav, Gheric and the XREngine Team
 */
export class Engine {
  static instance: Engine

  /** The uuid of the logged-in user */
  static userId: UserId

  static store = createHyperStore({
    name: 'ENGINE',
    getDispatchId: () => 'engine',
    getDispatchTime: () => Engine.elapsedTime
  })

  static elapsedTime = 0

  static engineTimer: { start: Function; stop: Function; clear: Function } = null!

  static isBot = false

  static isHMD = false

  /**
   * The current world
   */
  static currentWorld: World = null!

  /**
   * All worlds that are currently instantiated
   */
  static worlds: World[] = []

  /**
   * Reference to the three.js scene object.
   */
  static scene: Scene = null!
  static get sceneLoaded() {
    return accessEngineState().sceneLoaded.value
  }
  static sceneLoadPromises: Promise<void>[] = []

  /**
   * Map of object lists by layer
   * (automatically updated by the SceneObjectSystem)
   */
  static objectLayerList = {} as { [layer: number]: Set<Object3D> }

  /**
   * Reference to the three.js perspective camera object.
   */
  static camera: PerspectiveCamera | OrthographicCamera = null!
  static activeCameraEntity: Entity
  static activeCameraFollowTarget: Entity | null

  /**
   * Reference to the audioListener.
   * This is a virtual listner for all positional and non-positional audio.
   */
  static audioListener: AudioListener = null!

  static inputState = new Map<any, InputValue>()
  static prevInputState = new Map<any, InputValue>()

  static get isInitialized() {
    return accessEngineState().isEngineInitialized.value
  }

  static publicPath: string

  static simpleMaterials = false
  static xrFrame: XRFrame

  static isEditor = false
}
