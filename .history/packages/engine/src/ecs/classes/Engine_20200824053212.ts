import { EntityPool } from './EntityPool';
import { EventDispatcher } from './EventDispatcher';
import { Query } from './Query';
import { WebGLRenderer, Camera, Scene } from 'three';
import { EngineOptions } from '../interfaces/EngineOptions';
import { DefaultOptions } from '../constants/DefaultOptions';
import { Entity } from './Entity';

export class Engine {

	public static stats: Stats;
	public static graphicsWorld: THREE.Scene;
	public static sky: Sky;
	public static physicsWorld: CANNON.World;
	public static parallelPairs: any[];
	public static physicsFrameRate: number;
	public static physicsFrameTime: number;
  public static physicsMaxPrediction: number;
  
  // BUG: Our time should produce these, need to populate
	public static renderDelta: number;
	public static logicDelta: number;
  public static sinceLastFrame: number;
	public static justRendered: boolean;
	public static params: any;
	public static inputManager: InputManager;
	public static cameraOperator: CameraOperator;
	public static timeScaleTarget: number = 1;
  public static csm: CSM;
  public static cannonDebugRenderer: CannonDebugRenderer;

  /**
   * Reference to the three.js renderer object
   * This is set in {@link @xr3ngine/engine/src/initialize#initializeEngine}
   */
  static renderer: WebGLRenderer = null

  /**
 * Reference to the three.js scene object
 * This is set in {@link @xr3ngine/engine/src/initialize#initializeEngine}
 */
  static scene: Scene

  /**
 * Reference to the three.js camera object
 * This is set in {@link @xr3ngine/engine/src/initialize#initializeEngine}
 */
  static camera: Camera = null

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
   * Timestamp of last time execute() was called
   */
  static lastTime: number

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
}
