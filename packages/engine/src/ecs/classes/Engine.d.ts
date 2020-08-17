import { Entity } from "./Entity";
import { EntityPool } from "./EntityPool";
import { EventDispatcher } from "./EventDispatcher";
import { Query } from "./Query";
import { WebGLRenderer, Camera } from "three";
import { SceneManager } from "../../common/classes/SceneManager";
export interface EngineOptions {
    entityPoolSize?: number;
    [propName: string]: any;
}
export declare class Engine {
    static renderer: WebGLRenderer;
    static engine: Engine;
    static sceneManager: SceneManager;
    static camera: Camera;
    static eventDispatcher: EventDispatcher;
    static options: {
        entityPoolSize: number;
        entityClass: typeof Entity;
    } & EngineOptions;
    static enabled: boolean;
    static deferredRemovalEnabled: boolean;
    static systems: any[];
    static entities: any[];
    static entitiesByName: {};
    static queries: Query[];
    static components: any[];
    static lastTime: number;
    static nextEntityId: number;
    static nextComponentId: number;
    static eventQueues: {};
    static entityPool: EntityPool;
    static componentsMap: {};
    static componentPool: {};
    static numComponents: {};
    static entitiesWithComponentsToRemove: any[];
    static entitiesToRemove: any[];
    static executeSystems: any[];
    static lastExecutedSystem: any;
    static initialize(options?: EngineOptions): void;
}
export declare function initializeEngine(options?: EngineOptions): void;
export declare function execute(delta?: number, time?: number): void;
export declare function stop(): void;
export declare function stats(): {
    entities: any;
    system: any;
};
