import { Object3D, PerspectiveCamera, Scene, WebGLRenderer, XRFrame, XRSession } from 'three'
import { Entity } from './Entity'
import { InputValue } from '../../input/interfaces/InputValue'
import { CSM } from '../../assets/csm/CSM'
import { EffectComposerWithSchema } from '../../renderer/WebGLRendererSystem'
import { OrthographicCamera } from 'three'
import { World } from '../classes/World'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

/**
 * This is the base class which holds all the data related to the scene, camera,system etc.
 * Data is holded statically hence will be available everywhere.
 *
 * @author Shaw, Josh, Vyacheslav, Gheric and the XREngine Team
 */
export class Engine {
  static instance: Engine = null!
  /** The uuid of the logged-in user */
  userId: UserId

  engineTimer: { start: Function; stop: Function; clear: Function } = null!

  xrSupported = false
  isBot = false

  isHMD = false

  /**
   * The default world
   */
  defaultWorld: World = null!

  /**
   * The currently executing world
   */
  currentWorld: World | null = null

  /**
   * All worlds that are currently instantiated
   */
  worlds: World[] = []

  /**
   * Reference to the three.js renderer object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   */
  renderer: WebGLRenderer = null!
  effectComposer: EffectComposerWithSchema = null!
  xrManager = null! as any
  xrSession: XRSession = null!
  csm: CSM = null!
  /**
   * Reference to the three.js scene object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   */
  scene: Scene = null!
  sceneLoaded = false

  /**
   * Map of object lists by layer
   * (automatically updated by the SceneObjectSystem)
   */
  objectLayerList = {} as { [layer: number]: Set<Object3D> }

  /**
   * Reference to the three.js perspective camera object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   */
  camera: PerspectiveCamera | OrthographicCamera = null!
  activeCameraEntity: Entity
  activeCameraFollowTarget: Entity | null

  /**
   * Reference to the audioListener.
   * This is a virtual listner for all positional and non-positional audio.
   */
  audioListener: any = null

  inputState = new Map<any, InputValue>()
  prevInputState = new Map<any, InputValue>()

  isInitialized = false

  hasJoinedWorld = false

  publicPath: string

  workers = [] as any[]
  simpleMaterials = false

  hasEngaged = false
  mouseInputEnabled = true
  keyboardInputEnabled = true

  xrFrame: XRFrame
}

export function createEngine() {
  console.log('Creating engine')
  if (!Engine.instance) Engine.instance = new Engine()
  return Engine.instance
}

export function useEngine() {
  return Engine.instance!
}
