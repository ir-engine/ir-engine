/** Functions to provide system level functionalities. */

import { System, SystemConstructor } from '../classes/System'
import { SystemUpdateType } from '../functions/SystemUpdateType'
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
export function registerSystem<S extends System>(
  updateType: SystemUpdateType,
  SystemClass: SystemConstructor<S, void>
): System
export function registerSystem<S extends System, A>(
  updateType: SystemUpdateType,
  SystemClass: SystemConstructor<S, A>,
  attributes: A
): System
export function registerSystem<S extends System, A = void>(
  updateType: SystemUpdateType,
  SystemClass: SystemConstructor<S, A>,
  attributes?: any
): System {
  if (!SystemClass.isSystem) {
    throw new Error(`System '${SystemClass.name}' does not extend 'System' class`)
  }

  if (getSystem(SystemClass) !== undefined) {
    console.warn(`System '${SystemClass.name}' already registered.`)
  }

  SystemClass.updateType = updateType

  const system = new SystemClass(attributes)
  Engine.systems.push(system)
  if (system.execute) {
    Engine.activeSystems.add(updateType, system)
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
export function unregisterSystem(updateType: SystemUpdateType, SystemClass: SystemConstructor<any, any>): void {
  const system = getSystem(SystemClass)
  if (system === undefined) {
    console.warn(`Can't unregister system '${SystemClass.name}'. It doesn't exist.`)
  }

  Engine.systems.splice(Engine.systems.indexOf(system), 1)

  if (system.execute) Engine.activeSystems.remove(updateType, system)
}

/**
 * Get a system from the simulation.
 *
 * @author Fernando Serrano, Robert Long
 * @param SystemClass Type ot the system.
 * @returns System instance.
 */
export function getSystem<S extends System>(SystemClass: SystemConstructor<S, any>): S {
  return Engine.systems.find((s) => s instanceof SystemClass) as S
}

/**
 * Get all systems from the simulation.
 *
 * @author Fernando Serrano, Robert Long
 * @returns Array of system instances.
 */
export function getSystems(): System[] {
  return Engine.systems
}
