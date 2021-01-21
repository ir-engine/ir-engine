/** Functions to provide system level functionalities. */

import { System, SystemConstructor } from '../classes/System';
import { Engine } from '../classes/Engine';
import { now } from '../../common/functions/now';
import { SystemUpdateType } from './SystemUpdateType';

/**
 * Register a system with the simulation.\
 * System will automatically register all components in queries and be added to execution queue.
 * 
 * @param SystemClass Type of system to be registered.
 * @param attributes Attributes of the system being created.
 * @returns Registered system.
 */
export function registerSystem (SystemClass: SystemConstructor<any>, attributes?: any): System {
  if (!SystemClass.isSystem) {
    throw new Error(`System '${SystemClass.name}' does not extend 'System' class`);
  }

  if (getSystem(SystemClass) !== undefined) {
    console.warn(`System '${SystemClass.name}' already registered.`);
  }

  const system = new SystemClass(attributes);
  Engine.systems.push(system);
  if (system.execute) {
    Engine.systemsToExecute.push(system);
    sortSystems();
  }
  return system as System;
}

/**
 * Remove a system from the simulation.\
 * **NOTE:** System won't unregister components, so make sure you clean up!
 * 
 * @param SystemClass Type of system being unregistered.
 */
export function unregisterSystem (SystemClass: SystemConstructor<any>): void {
  const system = getSystem(SystemClass);
  if (system === undefined) {
    console.warn(`Can't unregister system '${SystemClass.name}'. It doesn't exist.`);
  }

  Engine.systems.splice(Engine.systems.indexOf(system), 1);

  if (system.execute) Engine.systemsToExecute.splice(Engine.systemsToExecute.indexOf(system), 1);
}

/**
 * Get a system from the simulation.
 * 
 * @param SystemClass Type ot the system.
 * @returns System instance.
 */
export function getSystem<S extends System> (SystemClass: SystemConstructor<S>): S {
  return Engine.systems.find(s => s instanceof SystemClass);
}

/**
 * Get all systems from the simulation.
 * @returns Array of system instances.
 */
export function getSystems (): System[] {
  return Engine.systems;
}

/**
 * Calls execute() function on a system instance.
 * 
 * @param system System to be executed.
 * @param delta Delta of the system.
 * @param time Current time of the system.
 * @param updateType Only system of this Update type will be executed.
 */
export function executeSystem (system: System, delta: number, time: number, updateType = SystemUpdateType.Free): void {
  if (system.initialized  && updateType === system.updateType) {
      const startTime = now();
        system.execute(delta, time);
        system.executeTime = now() - startTime;
        system.clearEventQueues();
    }
}

/**
 * Sort systems by order if order has been set explicitly.
 */
export function sortSystems (): void {
  Engine.systemsToExecute.sort((a, b) => {
    return a.priority - b.priority || a.order - b.order;
  });
}
