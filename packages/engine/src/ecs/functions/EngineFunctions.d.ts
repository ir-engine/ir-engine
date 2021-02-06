/** Functions to provide engine level functionalities. */
import { EngineOptions } from '../interfaces/EngineOptions';
import { SystemUpdateType } from "./SystemUpdateType";
/**
 * Initialize options on the engine object and fire a command for devtools.\
 * **WARNING:** This is called by {@link initialize.initializeEngine | initializeEngine()}.\
 * You probably don't want to use this.
 */
export declare function initialize(options?: EngineOptions): void;
/** Reset the engine and remove everything from memory. */
export declare function reset(): void;
/**
 * Execute all systems (a "frame").
 * This is typically called on a loop.
 * **WARNING:** This is called by {@link initialize.initializeEngine | initializeEngine()}.\
 * You probably don't want to use this.
 */
export declare function execute(delta?: number, time?: number, updateType?: SystemUpdateType): void;
/**
 * Disable execution of systems without stopping timer.
 */
export declare function pause(): void;
/**
 * Get stats for all entities, components and systems in the simulation.
 */
export declare function stats(): {
    entities: any;
    system: any;
};
/** Reset the engine and clear all the timers. */
export declare function resetEngine(): void;
