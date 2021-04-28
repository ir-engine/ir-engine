/**
 * This file constains declaration of Engine Class.
 *
 * @author Fernando Serrano, Robert Long
 * @packageDocumentation
 */

import {
  AudioListener as THREE_AudioListener,
  Clock,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AudioLoader as THREE_AudioLoader,
  VideoTexture as THREE_VideoTexture,
  Audio as THREE_Audio,
  PositionalAudio as THREE_PositionalAudio,
  XRSession
} from 'three';
import { CSM } from '../../assets/csm/CSM';
import { ServerSpawnSystem } from "../../scene/systems/SpawnSystem";
import { TransformComponent } from '../../transform/components/TransformComponent';
import { EngineOptions } from '../interfaces/EngineOptions';
import { Entity } from './Entity';
import { EntityPool } from './EntityPool';
import { EntityEventDispatcher } from './EntityEventDispatcher';
import { Query } from './Query';
import { createElement } from '../functions/createElement';
import { isWebWorker } from '../../common/functions/getEnvironment';
import { VideoTextureProxy } from '../../worker/VideoTexture';
import { PositionalAudioObjectProxy, AudioObjectProxy, AudioListenerProxy, AudioLoaderProxy } from '../../worker/Audio';
import { BinaryType, NumericalType } from '../../common/types/NumericalTypes';
import { InputValue } from '../../input/interfaces/InputValue';


export const Audio = isWebWorker ? AudioObjectProxy : THREE_Audio;
export const AudioListener = isWebWorker ? AudioListenerProxy : THREE_AudioListener;
export const AudioLoader = isWebWorker ? AudioLoaderProxy : THREE_AudioLoader;
export const PositionalAudio = isWebWorker ? PositionalAudioObjectProxy : THREE_PositionalAudio;
export const VideoTexture = isWebWorker ? VideoTextureProxy : THREE_VideoTexture;

export type Audio = AudioObjectProxy | THREE_Audio;
export type AudioListener = AudioListenerProxy | THREE_AudioListener;
export type AudioLoader = AudioLoaderProxy | THREE_AudioLoader;
export type PositionalAudio = PositionalAudioObjectProxy | THREE_PositionalAudio;
export type VideoTexture = VideoTextureProxy | THREE_VideoTexture;


/**
 * This is the base class which holds all the data related to the scene, camera,system etc.\
 * Data is holded statically hence will be available everywhere.
 *
 * @author Fernando Serrano, Robert Long
 */
export class Engine {

  public static engineTimer: { start: Function; stop: Function } = null
  public static engineTimerTimeout = null;

  public static gameModes = [];

  public static xrSupported = false;

  public static offlineMode = false;

  //public static stats: Stats
  // Move for sure
  // public static sky: Sky;

  /** Indicates whether engine is currently executing or not. */
  public static isExecuting = false;

  /**
   * Frame rate for physics system.
   *
   * @author Fernando Serrano, Robert Long
   * @Default 60
   */
  public static physicsFrameRate = 60;

  /**
   * Frame rate for network system.
   *
   * @author Fernando Serrano, Robert Long
   * @default 20
   */
  public static networkFramerate = 20;

  public static accumulator: number;
  public static justExecuted: boolean;
  public static params: any;
  /**
   * @default 1
   */
  public static timeScaleTarget = 1;
  public static clock = new Clock;

  /**
   * Reference to the three.js renderer object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   *
   * @author Fernando Serrano, Robert Long
   */
  static renderer: WebGLRenderer = null
  static csm: CSM = null
  static xrSession: XRSession = null
  static context = null

  /**
   * Reference to the three.js scene object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   *
   * @author Fernando Serrano, Robert Long
   */
  static scene: Scene = null
  static sceneLoaded = false;

  /**
   * Reference to the three.js perspective camera object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   *
   * @author Fernando Serrano, Robert Long
   */
   static camera: PerspectiveCamera = null

  /**
   * Reference to the Transform component of the three.js camera object.
   * This holds data related to camera position, angle etc.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   *
   * @author Fernando Serrano, Robert Long
   */
  static cameraTransform: TransformComponent = null

  /**
   * Reference to the audioListener.
   * This is a virtual listner for all positional and non-positional audio.
   *
   * @author Fernando Serrano, Robert Long
   */
  static audioListener: any = null

  /**
   * Event dispatcher manages sending events which can be interpreted by devtools.
   *
   * @author Fernando Serrano, Robert Long
   */
  static eventDispatcher = new EntityEventDispatcher()

  /**
  * Initialization options.
  *
  * @author Fernando Serrano, Robert Long
  */
  static options: { /** @default 0 */ entityPoolSize: number } & EngineOptions = {
    entityPoolSize: 0
  };

  /**
   * Controls whether engine should execute this frame.
   * Engine can be paused by setting enabled to false.
   *
   * @author Fernando Serrano, Robert Long
   * @default true
   */
  static enabled = true

  /**
   * Controls whether components should be removed immediately or after all systems execute.
   *
   * @author Fernando Serrano, Robert Long
   * @default true
   */
  static deferredRemovalEnabled = true

  /**
   * List of registered systems.
   *
   * @author Fernando Serrano, Robert Long
   */
  static systems: any[] = []

  /**
   * List of registered entities.
   *
   * @author Fernando Serrano, Robert Long
   */
  static entities: Entity[] = []

  /**
   * Map of registered entities by ID
   *
   * @author Fernando Serrano, Robert Long
   */
  static entityMap: Map<string, Entity> = new Map<string, Entity>();

  /**
   * List of registered queries.
   *
   * @author Fernando Serrano, Robert Long
   */
  static queries: Query[] = []

  /**
   * List of registered components.
   *
   * @author Fernando Serrano, Robert Long
   */
  static components: any[] = []

  /**
   * Next entity created will have this ID.
   *
   * @author Fernando Serrano, Robert Long
   */
  static nextEntityId = 0

  /**
   * Next component created will have this ID.
   *
   * @author Fernando Serrano, Robert Long
   */
  static nextComponentId = 0

  /**
   * Pool of available entities.
   *
   * @author Fernando Serrano, Robert Long
   */
  static entityPool: EntityPool = new EntityPool(Entity)

  /**
   * Map of component classes to their type ID.
   *
   * @author Fernando Serrano, Robert Long
   */
  static componentsMap: {} = {}

  /**
   * List of component pools, one for each component class.
   *
   * @author Fernando Serrano, Robert Long
   */
  static componentPool: {} = {}

  /**
   * Stores a count for each component type.
   *
   * @author Fernando Serrano, Robert Long
   */
  static numComponents: {} = {}

  /**
   * List of entities with components that will be removed at the end of this frame.
   * @todo replace with a ring buffer and set buffer size in default options
   *
   * @author Fernando Serrano, Robert Long
   */
  static entitiesWithComponentsToRemove: any[] = []

  /**
   * List of entities that will be removed at the end of this frame.
   * @todo replace with a ring buffer and set buffer size in default options
   *
   * @author Fernando Serrano, Robert Long
   */
  static entitiesToRemove: any[] = []

  /**
   * List of systems to execute this frame.
   * @todo replace with a ring buffer and set buffer size in default options
   *
   * @author Fernando Serrano, Robert Long
   */
  static systemsToExecute: any[] = []
  static vehicles: any;
  static lastTime: number;
  static tick = 0;
  /** HTML Element in which Engine renders. */
  static viewportElement: HTMLElement;

  static spawnSystem: ServerSpawnSystem;

  static createElement: any = createElement;

  static hasUserEngaged = false;

  static useAudioSystem = false;

  static inputState = new Map<any, InputValue<NumericalType>>();
  static prevInputState = new Map<any, InputValue<NumericalType>>();

  static isInitialized = false;

  /**
   * Input inherits from BehaviorComponent, which adds .map and .data
   *
   * @author Fernando Serrano, Robert Long
   * @property {Boolean} gamepadConnected Connection a new gamepad
   * @property {Number} gamepadThreshold Threshold value from 0 to 1
   * @property {Binary[]} gamepadButtons Map gamepad buttons
   * @property {Number[]} gamepadInput Map gamepad buttons to abstract input
   */
  static gamepadConnected = false;
  static gamepadThreshold = 0.1;
  static gamepadButtons: BinaryType[] = [];
  static gamepadInput: number[] = [];

  static publicPath: string;
}
