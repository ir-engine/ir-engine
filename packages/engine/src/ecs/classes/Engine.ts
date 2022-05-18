/**
 * This file constains declaration of Engine Class.
 *
 * @author Fernando Serrano, Robert Long
 * @packageDocumentation
 */

import { PerspectiveCamera, Scene, WebGLRenderer, XRFrame, XRSession } from 'three'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Entity } from './Entity'
import { InputValue } from '../../input/interfaces/InputValue'
import { EngineEvents } from './EngineEvents'
import { InitializeOptions } from '../../initializationOptions'
import { CSM } from '../../assets/csm/CSM'
import { EffectComposerWithSchema } from '../../renderer/WebGLRendererSystem'
import { OrthographicCamera } from 'three'
import { World } from '../classes/World'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { getEntityComponents } from 'bitecs'

/**
 * This is the base class which holds all the data related to the scene, camera,system etc.
 * Data is holded statically hence will be available everywhere.
 *
 * @author Shaw, Josh, Vyacheslav, Gheric and the XREngine Team
 */
export class Engine {
  /** The uuid of the logged-in user */
  public static userId: UserId

  public static initOptions: InitializeOptions
  public static engineTimer: { start: Function; stop: Function; clear: Function } = null!

  public static xrSupported = false
  public static isBot = false

  public static offlineMode = false
  public static isHMD = false

  //public static stats: Stats
  // Move for sure
  // public static sky: Sky;

  /** Indicates whether engine is currently executing or not. */
  public static isExecuting = false

  /**
   * Frame rate for physics system.
   *
   * @default 60
   */
  public static physicsFrameRate = 60
  public static physxWorker: Worker = null!

  /**
   * Frame rate for network system.
   *
   * @default 20
   */

  public static accumulator: number
  public static justExecuted: boolean
  public static params: any
  /**
   * @default 1
   */
  public static timeScaleTarget = 1

  /**
   * The default world
   */
  public static defaultWorld: World = null!

  /**
   * The currently executing world
   */
  public static currentWorld: World | null = null

  /**
   * All worlds that are currently instantiated
   */
  public static worlds: World[] = []

  /**
   * Reference to the three.js renderer object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   */
  static renderer: WebGLRenderer = null!
  static effectComposer: EffectComposerWithSchema = null!
  static xrManager = null! as any
  static xrSession: XRSession = null!
  static context = null!
  static csm: CSM = null!
  /**
   * Reference to the three.js scene object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   */
  static scene: Scene = null!
  static sceneLoaded = false

  /**
   * Reference to the three.js perspective camera object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   */
  static camera: PerspectiveCamera | OrthographicCamera = null!
  static activeCameraEntity: Entity
  static activeCameraFollowTarget: Entity | null

  /**
   * Reference to the Transform component of the three.js camera object.
   * This holds data related to camera position, angle etc.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   */
  static cameraTransform: typeof TransformComponent

  /**
   * Reference to the audioListener.
   * This is a virtual listner for all positional and non-positional audio.
   */
  static audioListener: any = null

  /**
   * Controls whether engine should execute this frame.
   * Engine can be paused by setting enabled to false.
   * @default true
   */
  static enabled = true

  static tick = 0

  static useAudioSystem = false

  static inputState = new Map<any, InputValue>()
  static prevInputState = new Map<any, InputValue>()

  static isInitialized = false

  static hasJoinedWorld = false

  static publicPath: string

  static workers = [] as any[]
  static simpleMaterials = false

  static hasEngaged = false
  static mouseInputEnabled = true
  static keyboardInputEnabled = true

  static xrFrame: XRFrame
  static spatialAudio = false
  static xrControllerModel = true

  static getEntityComponents = getEntityComponents
}

export const awaitEngineLoaded = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    if (Engine.isInitialized) resolve()
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.INITIALIZED_ENGINE, resolve)
  })
}

export const awaitEngaged = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    if (Engine.hasEngaged) resolve()
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.USER_ENGAGE, resolve)
  })
}
