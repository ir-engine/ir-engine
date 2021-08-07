/**
 * This file constains declaration of Engine Class.
 *
 * @author Fernando Serrano, Robert Long
 * @packageDocumentation
 */

import { PerspectiveCamera, Scene, WebGLRenderer, XRFrame, XRSession } from 'three'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { EngineOptions } from '../interfaces/EngineOptions'
import { Entity } from './Entity'
import { EntityPool } from './EntityPool'
import { EntityEventDispatcher } from './EntityEventDispatcher'
import { Query } from './Query'
import { createElement } from '../functions/createElement'
import { NumericalType } from '../../common/types/NumericalTypes'
import { InputValue } from '../../input/interfaces/InputValue'
import { GameMode } from '../../game/types/GameMode'
import { EngineEvents } from './EngineEvents'
import { ActiveSystems, System } from './System'
import { InitializeOptions } from '../../initializationOptions'
import { CSM } from '../../assets/csm/CSM'
import { EffectComposerWithSchema } from '../../renderer/WebGLRendererSystem'
import { OrthographicCamera } from 'three'

/**
 * This is the base class which holds all the data related to the scene, camera,system etc.
 * Data is holded statically hence will be available everywhere.
 *
 * @author Shaw, Josh, Vyacheslav and the XREngine Team
 */
export class Engine {
  public static initOptions: InitializeOptions
  public static engineTimer: { start: Function; stop: Function; clear: Function } = null

  public static gameModes: Map<string, GameMode> = new Map()

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
  public static physxWorker: Worker = null

  /**
   * Frame rate for network system.
   *
   * @default 20
   */
  public static networkFramerate = 20

  public static accumulator: number
  public static justExecuted: boolean
  public static params: any
  /**
   * @default 1
   */
  public static timeScaleTarget = 1

  /**
   * Reference to the three.js renderer object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   */
  static renderer: WebGLRenderer = null
  static effectComposer: EffectComposerWithSchema = null
  static xrRenderer = null
  static xrSession: XRSession = null
  static context = null
  static csm: CSM = null
  /**
   * Reference to the three.js scene object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   */
  static scene: Scene = null
  static sceneLoaded = false

  /**
   * Reference to the three.js perspective camera object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   */
  static camera: PerspectiveCamera | OrthographicCamera = null
  static activeCameraEntity: Entity

  /**
   * Reference to the Transform component of the three.js camera object.
   * This holds data related to camera position, angle etc.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   */
  static cameraTransform: TransformComponent = null

  /**
   * Reference to the audioListener.
   * This is a virtual listner for all positional and non-positional audio.
   */
  static audioListener: any = null

  /**
   * Event dispatcher manages sending events which can be interpreted by devtools.
   */
  static eventDispatcher = new EntityEventDispatcher()

  /**
   * Initialization options.
   */
  static options: { /** @default 0 */ entityPoolSize: number } & EngineOptions = {
    entityPoolSize: 0
  }

  /**
   * Controls whether engine should execute this frame.
   * Engine can be paused by setting enabled to false.
   * @default true
   */
  static enabled = true

  /**
   * Controls whether components should be removed immediately or after all systems execute.
   * @default true
   */
  static deferredRemovalEnabled = true

  /**
   * List of registered systems.
   */
  static systems: System[] = []

  /**
   * List of registered entities.
   */
  static entities: Entity[] = []

  /**
   * Map of registered entities by ID
   */
  static entityMap: Map<string, Entity> = new Map<string, Entity>()

  /**
   * List of registered queries.
   */
  static queries: Query[] = []

  /**
   * List of registered components.
   */
  static components: any[] = []

  /**
   * Next entity created will have this ID.
   */
  static nextEntityId = 0

  /**
   * Next component created will have this ID.
   */
  static nextComponentId = 0

  /**
   * Pool of available entities.
   */
  static entityPool: EntityPool = new EntityPool(Entity)

  /**
   * Map of component classes to their type ID.
   */
  static componentsMap: {} = {}

  /**
   * List of component pools, one for each component class.
   */
  static componentPool: {} = {}

  /**
   * Stores a count for each component type.
   */
  static numComponents: {} = {}

  /**
   * List of entities with components that will be removed at the end of this frame.
   * @todo replace with a ring buffer and set buffer size in default options
   */
  static entitiesWithComponentsToRemove: any[] = []

  /**
   * List of entities that will be removed at the end of this frame.
   * @todo replace with a ring buffer and set buffer size in default options
   */
  static entitiesToRemove: any[] = []

  /**
   * List of systems to execute this frame.
   * @todo replace with a ring buffer and set buffer size in default options
   *
   * @author Fernando Serrano, Robert Long
   */
  static activeSystems: ActiveSystems = null
  static lastTime: number

  static tick = 0
  /** HTML Element in which Engine renders. */
  static viewportElement: HTMLElement

  static createElement: any = createElement

  static useAudioSystem = false

  static inputState = new Map<any, InputValue<NumericalType>>()
  static prevInputState = new Map<any, InputValue<NumericalType>>()

  static isInitialized = false

  static hasJoinedWorld = false

  static publicPath: string

  static workers = []
  static simpleMaterials = false

  static hasEngaged = false
  static mouseInputEnabled = true
  static keyboardInputEnabled = true

  static xrFrame: XRFrame
  static spatialAudio = false
  static portCamera: boolean
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
