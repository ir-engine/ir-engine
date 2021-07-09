/** Functions to provide system level functionalities. */

import { System, SystemConstructor } from '../classes/System'
import { Engine } from '../classes/Engine'

/**
 * Register a system with the simulation.\
 * System will automatically register all components in queries and be added to execution queue.
 *
 * @author Fernando Serrano, Robert Long
 * @param SystemClass Type of system to be registered.
 * @param attributes Attributes of the system being created.
 * @returns Registered system.
 */
export function registerSystem (SystemClass: SystemConstructor<any>, attributes?: any): System {
  if (!SystemClass.isSystem) {
    throw new Error(`System '${SystemClass.name}' does not extend 'System' class`)
  }

  if (getSystem(SystemClass) !== undefined) {
    console.warn(`System '${SystemClass.name}' already registered.`)
  }

  const system = new SystemClass(attributes)
  Engine.systems.push(system)
  if (system.execute) {
    Engine.activeSystems.add(system)
    Engine.activeSystems.sort(system.updateType)
  }
  return system as System
}

/**
 * Remove a system from the simulation.\
 * **NOTE:** System won't unregister components, so make sure you clean up!
 *
 * @author Fernando Serrano, Robert Long
 * @param SystemClass Type of system being unregistered.
 */
export function unregisterSystem (SystemClass: SystemConstructor<any>): void {
  const system = getSystem(SystemClass)
  if (system === undefined) {
    console.warn(`Can't unregister system '${SystemClass.name}'. It doesn't exist.`)
  }

  Engine.systems.splice(Engine.systems.indexOf(system), 1)

  if (system.execute) Engine.activeSystems.remove(system)
}

/**
 * Get a system from the simulation.
 *
 * @author Fernando Serrano, Robert Long
 * @param SystemClass Type ot the system.
 * @returns System instance.
 */
export function getSystem<S extends System> (SystemClass: SystemConstructor<S>): S {
  return Engine.systems.find(s => s instanceof SystemClass) as S
}

/**
 * Get all systems from the simulation.
 *
 * @author Fernando Serrano, Robert Long
 * @returns Array of system instances.
 */
export function getSystems (): System[] {
  return Engine.systems
}
