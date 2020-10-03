import { System, SystemConstructor } from '../classes/System';
import { Engine } from '../classes/Engine';
import { now } from '../../common/functions/now';

/**
 * Register a system with the simulation
 * System will automatically register all components in queries and be added to execution queue
 * @returns registered system
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
 * Remove a system from the simulation
 * NOTE: System won't unregister components, so make sure you clean up!
 */
export function unregisterSystem (SystemClass: SystemConstructor<any>): void {
  const system = getSystem(SystemClass);
  if (system === undefined) {
    console.warn(`Can unregister system '${SystemClass.name}'. It doesn't exist.`);
  }

  Engine.systems.splice(Engine.systems.indexOf(system), 1);

  if (system.execute) Engine.systemsToExecute.splice(Engine.systemsToExecute.indexOf(system), 1);
}

/**
 * Get a system from the simulation
 * @returns system instance
 */
export function getSystem<S extends System> (SystemClass: SystemConstructor<S>): S {
  return Engine.systems.find(s => s instanceof SystemClass);
}

/**
 * Get all systems from the simulation
 * @returns array of system instances
 */
export function getSystems (): System[] {
  return Engine.systems;
}

/**
 * Call execute() function on a system instance
 */
export function executeSystem (system: System, delta: number, time: number): void {
  if (system.initialized) {
    if (system.canExecute(delta)) {
      const startTime = now();
      system.execute(delta, time);
      system.executeTime = now() - startTime;
      system.clearEventQueues();
    }
  }
}

/**
 * Sort systems by order if order has been set explicitly
 */
export function sortSystems () {
  Engine.systemsToExecute.sort((a, b) => {
    return a.priority - b.priority || a.order - b.order;
  });
}
