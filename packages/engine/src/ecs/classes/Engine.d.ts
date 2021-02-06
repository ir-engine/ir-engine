/**
 * This file constains declaration of Engine Class.
 * @packageDocumentation
 */
import { EngineOptions } from '../interfaces/EngineOptions';
import { EntityPool } from './EntityPool';
import { EventDispatcher } from './EventDispatcher';
import { Query } from './Query';
import { WebGLRenderer, PerspectiveCamera, Scene, Clock, AudioListener } from 'three';
import { Entity } from './Entity';
import { CameraOperator } from '../../camera/classes/CameraOperator';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ServerSpawnSystem } from "../../scene/systems/SpawnSystem";
import { CSM } from '../../assets/csm/CSM.js';
/**
 * This is the base class which holds all the data related to the scene, camera,system etc.\
 * Data is holded statically hence will be available everywhere.
 */
export declare class Engine {
    static engineTimer: {
        start: Function;
        stop: Function;
    };
    static engineTimerTimeout: any;
    static engineIKTimer: {
        start: Function;
        stop: Function;
    };
    /** Indicates whether engine is currently executing or not. */
    static isExecuting: boolean;
    /**
     * Frame rate for physics system.
     * @Default 60
     */
    static physicsFrameRate: number;
    /**
     * Frame rate for network system.
     * @default 20
     */
    static networkFramerate: number;
    static accumulator: number;
    static justExecuted: boolean;
    static params: any;
    static cameraOperator: CameraOperator;
    /**
     * @default 1
     */
    static timeScaleTarget: number;
    static clock: Clock;
    /**
     * Reference to the three.js renderer object.
     * This is set in {@link initialize.initializeEngine | initializeEngine()}.
     */
    static renderer: WebGLRenderer;
    static csm: CSM;
    static xrSession: any;
    static xrReferenceSpace: any;
    static context: any;
    /**
     * Reference to the three.js scene object.
     * This is set in {@link initialize.initializeEngine | initializeEngine()}.
     */
    static scene: Scene;
    /**
     * Reference to the three.js perspective camera object.
     * This is set in {@link initialize.initializeEngine | initializeEngine()}.
     */
    static camera: PerspectiveCamera;
    /**
     * Reference to the Transform component of the three.js camera object.
     * This holds data related to camera position, angle etc.
     * This is set in {@link initialize.initializeEngine | initializeEngine()}.
     */
    static cameraTransform: TransformComponent;
    /**
     * Reference to the audioListener.
     * This is a virtual listner for all positional and non-positional audio.
     */
    static audioListener: AudioListener;
    /**
     * Event dispatcher manages sending events which can be interpreted by devtools.
     */
    static eventDispatcher: EventDispatcher;
    /**
    * Initialization options.
    */
    static options: {
        entityPoolSize: number;
    } & EngineOptions;
    /**
     * Controls whether engine should execute this frame.
     * Engine can be paused by setting enabled to false.
     * @default true
     */
    static enabled: boolean;
    /**
     * Controls whether components should be removed immediately or after all systems execute.
     * @default true
     */
    static deferredRemovalEnabled: boolean;
    /**
     * List of registered systems.
     */
    static systems: any[];
    /**
     * List of registered entities.
     */
    static entities: Entity[];
    /**
     * List of registered queries.
     */
    static queries: Query[];
    /**
     * List of registered components.
     */
    static components: any[];
    /**
     * Next entity created will have this ID.
     */
    static nextEntityId: number;
    /**
     * Next component created will have this ID.
     */
    static nextComponentId: number;
    /**
     * Pool of available entities.
     */
    static entityPool: EntityPool;
    /**
     * Map of component classes to their type ID.
     */
    static componentsMap: {};
    /**
     * List of component pools, one for each component class.
     */
    static componentPool: {};
    /**
     * Stores a count for each component type.
     */
    static numComponents: {};
    /**
     * List of entities with components that will be removed at the end of this frame.
     * @todo replace with a ring buffer and set buffer size in default options
     */
    static entitiesWithComponentsToRemove: any[];
    /**
     * List of entities that will be removed at the end of this frame.
     * @todo replace with a ring buffer and set buffer size in default options
     */
    static entitiesToRemove: any[];
    /**
     * List of systems to execute this frame.
     * @todo replace with a ring buffer and set buffer size in default options
     */
    static systemsToExecute: any[];
    static vehicles: any;
    static lastTime: number;
    static tick: number;
    /** HTML Element in which Engine renders. */
    static viewportElement: HTMLElement;
    static spawnSystem: ServerSpawnSystem;
}
