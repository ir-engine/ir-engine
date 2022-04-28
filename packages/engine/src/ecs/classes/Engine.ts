import { AudioListener, Object3D, OrthographicCamera, PerspectiveCamera, Scene, XRFrame } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { addActionReceptor, createHyperStore, registerState } from '@xrengine/hyperflux'

import { InputValue } from '../../input/interfaces/InputValue'
import { WorldState } from '../../networking/interfaces/WorldState'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { createWorld, World } from '../classes/World'
import { accessEngineState, EngineEventReceptor } from './EngineService'
import { Entity } from './Entity'

export const CreateEngine = Symbol('CreateEngine')

/**
 * Creates a new instance of the engine. This initializes all properties and state for the engine,
 * adds action receptors and creates a new world.
 * @returns {Engine}
 */
export function createEngine() {
  return Engine[CreateEngine]()
}

export class Engine {
  static [CreateEngine] = () => new Engine()
  static instance: Engine

  constructor() {
    Engine.instance = this
    this.currentWorld = createWorld()
    this.scene = new Scene()
    this.scene.layers.set(ObjectLayers.Scene)
    EngineRenderer.instance = new EngineRenderer()
    registerState(this.currentWorld.store, WorldState)
    addActionReceptor(this.store, EngineEventReceptor)
  }

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
  get sceneLoaded() {
    return accessEngineState().sceneLoaded.value
  }
  sceneLoadPromises: Promise<void>[] = []

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

  get isInitialized() {
    return accessEngineState().isEngineInitialized.value
  }

  publicPath: string = null!

  simpleMaterials = false
  xrFrame: XRFrame

  isEditor = false
}

globalThis.Engine = Engine
