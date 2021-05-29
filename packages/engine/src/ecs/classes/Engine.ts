/**
 * This file constains declaration of Engine Class.
 *
 * @author Fernando Serrano, Robert Long
 * @packageDocumentation
 */

import {
  AudioListener as THREE_AudioListener,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AudioLoader as THREE_AudioLoader,
  VideoTexture as THREE_VideoTexture,
  Audio as THREE_Audio,
  PositionalAudio as THREE_PositionalAudio,
  XRSession
} from 'three';
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
import { NumericalType } from '../../common/types/NumericalTypes';
import { InputValue } from '../../input/interfaces/InputValue';
import { GameMode } from "../../game/types/GameMode";
import { EngineEvents } from './EngineEvents';
import { WebXRManager } from '../../xr/WebXRManager';

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

  public static engineTimer: { start: Function; stop: Function, clear: Function } = null

  public static supportedGameModes: { [key: string]: GameMode };
  public static gameMode: GameMode;

  public static xrSupported = false;

  public static offlineMode = false;
  public static isHMD = false;

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

  /**
   * Reference to the three.js renderer object.
   * This is set in {@link initialize.initializeEngine | initializeEngine()}.
   *
   * @author Fernando Serrano, Robert Long
   */
  static renderer: WebGLRenderer = null
  static xrRenderer: WebXRManager = null
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

  /**
   * The current frame delta for use if needed outside the execute loop (such as events and callbacks)
   *
   * @author Josh Field
   */
  static delta: number = 1/60;
  static tick = 0;
  /** HTML Element in which Engine renders. */
  static viewportElement: HTMLElement;

  static createElement: any = createElement;

  static useAudioSystem = false;

  static inputState = new Map<any, InputValue<NumericalType>>();
  static prevInputState = new Map<any, InputValue<NumericalType>>();

  static isInitialized = false;

  static publicPath: string;

  static workers = [];
}

export const awaitEngineLoaded = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    if(Engine.isInitialized) resolve();
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.INITIALIZED_ENGINE, resolve)
  })
}


globalThis.Engine = Engine;