/** Functions to provide system level functionalities. */
import { System, SystemConstructor } from '../classes/System';
import { SystemUpdateType } from './SystemUpdateType';
/**
 * Register a system with the simulation.\
 * System will automatically register all components in queries and be added to execution queue.
 *
 * @param SystemClass Type of system to be registered.
 * @param attributes Attributes of the system being created.
 * @returns Registered system.
 */
export declare function registerSystem(SystemClass: SystemConstructor<any>, attributes?: any): System;
/**
 * Remove a system from the simulation.\
 * **NOTE:** System won't unregister components, so make sure you clean up!
 *
 * @param SystemClass Type of system being unregistered.
 */
export declare function unregisterSystem(SystemClass: SystemConstructor<any>): void;
/**
 * Get a system from the simulation.
 *
 * @param SystemClass Type ot the system.
 * @returns System instance.
 */
export declare function getSystem<S extends System>(SystemClass: SystemConstructor<S>): S;
/**
 * Get all systems from the simulation.
 * @returns Array of system instances.
 */
export declare function getSystems(): System[];
/**
 * Calls execute() function on a system instance.
 *
 * @param system System to be executed.
 * @param delta Delta of the system.
 * @param time Current time of the system.
 * @param updateType Only system of this Update type will be executed.
 */
export declare function executeSystem(system: System, delta: number, time: number, updateType?: SystemUpdateType): void;
/**
 * Sort systems by order if order has been set explicitly.
 */
export declare function sortSystems(): void;
