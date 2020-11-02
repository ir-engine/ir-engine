import { EntityPool } from './EntityPool';
import { EventDispatcher } from './EventDispatcher';
import { Query } from './Query';
import { WebGLRenderer, PerspectiveCamera, Scene, Clock,  } from 'three';
import { EngineOptions } from '../interfaces/EngineOptions';
import { DefaultOptions } from '../constants/DefaultOptions';
import { Entity } from './Entity';
import { CameraOperator } from '../../camera/classes/CameraOperator';
import { TransformComponent } from '../../transform/components/TransformComponent';

export class Engine {

  public static engineTimer: { start: Function; stop: Function } = null
  public static engineTimerTimeout;

  //public static stats: Stats
  // Move for sure
  // public static sky: Sky;
  public static isExecuting = false;

  public static framerateLimit = 60;
  public static physicsFrameRate = 60;

  public static accumulator: number;
	public static justExecuted: boolean;
	public static params: any;
	public static cameraOperator: CameraOperator;
	public static timeScaleTarget = 1;
  public static clock = new Clock;
  /**
   * Reference to the three.js renderer object
   * This is set in {@link @xr3ngine/engine/src/initialize#initializeEngine}
   */
  static renderer: WebGLRenderer = null
  static xrSession = null
//  static xrReferenceSpace = null
//  static context = null
  /**
 * Reference to the three.js scene object
 * This is set in {@link @xr3ngine/engine/src/initialize#initializeEngine}
 */
  static scene: Scene = null

  /**
 * Reference to the three.js camera object
 * This is set in {@link @xr3ngine/engine/src/initialize#initializeEngine}
 */
  static camera: PerspectiveCamera = null

  /**
 * Reference to the three.js camera object
 * This is set in {@link @xr3ngine/engine/src/initialize#initializeEngine}
 */
  static cameraTransform: TransformComponent = null

  /**
 * Event dispatcher manages sending events which can be interpreted by devtools
 */
  static eventDispatcher = new EventDispatcher()

  /**
* Initialization options
*/
  static options: { entityPoolSize: number } & EngineOptions = DefaultOptions

  /**
   * Controls whether engine should execute this frame
   * Engine can be paused by setting enabled to false
   */
  static enabled = true

  /**
   * Controls whether components should be removed immediately or after all systems execute
   */
  static deferredRemovalEnabled = true

  /**
   * List of registered systems
   * Engine can be paused by setting enabled to false
   */
  static systems: any[] = []

  /**
   * List of registered entities
   * Engine can be paused by setting enabled to false
   */
  static entities: Entity[] = []

  /**
   * List of registered queries
   * Engine can be paused by setting enabled to false
   */
  static queries: Query[] = []

  /**
   * List of registered components
   * Engine can be paused by setting enabled to false
   */
  static components: any[] = []

  /**
   * Next entity created will have this ID
   */
  static nextEntityId = 0

  /**
   * Next component created will have this ID
   */
  static nextComponentId = 0

  /**
   * Pool of available entities
   */
  static entityPool: EntityPool = new EntityPool(Entity)

  /**
   * Map of component classes to their type ID
   */
  static componentsMap: {} = {}

  /**
   * List of component pools, one for each component class
   */
  static componentPool: {} = {}

  /**
   * Stores a count for each component type
   */
  static numComponents: {} = {}

  /**
   * List of entities with components that will be removed this frame
   * @todo replace with a ring buffer and set buffer size in default options
   */
  static entitiesWithComponentsToRemove: any[] = []

  /**
   * List of entities that will be removed this frame
   * @todo replace with a ring buffer and set buffer size in default options
   */
  static entitiesToRemove: any[] = []

  /**
   * List of entities with components that will be removed this frame
   * @todo replace with a ring buffer and set buffer size in default options
   */
  static systemsToExecute: any[] = []
  static vehicles: any;
  static lastTime: number;
  static tick = 0;
  static viewportElement: HTMLElement;
}
