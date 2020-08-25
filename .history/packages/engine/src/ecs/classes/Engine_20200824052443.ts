import { EntityPool } from './EntityPool';
import { EventDispatcher } from './EventDispatcher';
import { Query } from './Query';
import { WebGLRenderer, Camera, Scene } from 'three';
import { EngineOptions } from '../interfaces/EngineOptions';
import { DefaultOptions } from '../constants/DefaultOptions';
import { Entity } from './Entity';

export class Engine {

	public stats: Stats;
	public graphicsWorld: THREE.Scene;
	public sky: Sky;
	public physicsWorld: CANNON.World;
	public parallelPairs: any[];
	public physicsFrameRate: number;
	public physicsFrameTime: number;
  public physicsMaxPrediction: number;
  
  // BUG: Our time should produce these, need to populate
	public renderDelta: number;
	public logicDelta: number;
  public sinceLastFrame: number;
	public justRendered: boolean;
	public params: any;
	public inputManager: InputManager;
	public cameraOperator: CameraOperator;
	public timeScaleTarget: number = 1;
  public csm: CSM;
  public cannonDebugRenderer: CannonDebugRenderer;

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
