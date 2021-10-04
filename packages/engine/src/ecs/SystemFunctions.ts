/** Functions to provide system level functionalities. */

import { SystemUpdateType } from './SystemUpdateType'
import { Engine } from './Engine'
import { System } from './System'
import { World } from './World'

/**
* Create a system function.
* @param world - World.
* @param props - Properties.
* @returns {Promise<System>}
* @internal
*/
export type CreateSystemFunctionType<A extends any> = (world: World, props?: A) => Promise<System>

/**
* System module.
* A system module is a function that returns a value of type {@link SystemModuleType}.
* @param {@link SystemModuleType} - Type of the value returned by the function.
* @internal
*/
export type SystemModule<A extends any> = { default: CreateSystemFunctionType<A> }

/**
* A promise for a system module.
* @param {SystemModule<A>} module - System module.
*/
export type SystemModulePromise<A extends any> = Promise<SystemModule<A>>

/**
* A SystemModuleType is a type of SystemModule.
* It has a systemModulePromise property, which is a promise that resolves to an instance of SystemModule.
* It has a type property, which is the type of the SystemModule.
* It has an args property, which is an optional list of arguments to pass to the SystemModule.
* @internal
*/
export type SystemModuleType<A> = {
  systemModulePromise: SystemModulePromise<A>
  type: SystemUpdateType
  args?: A
}

/**
* A type for a system factory.
* @param {SystemModule} systemModule - The system module.
* @param {SystemUpdateType} type - The type of update.
* @param {A} args - Arguments for the update.
*/
export type SystemFactoryType<A> = {
  systemModule: SystemModule<A>
  type: SystemUpdateType
  args?: A
}

/**
* Register a system.
* @param type - System type.
* @param systemModulePromise - System module promise.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
export const registerSystem = (type: SystemUpdateType, systemModulePromise: SystemModulePromise<void>) => {
  Engine.defaultWorld._pipeline.push({ type, systemModulePromise, args: undefined }) // yes undefined, V8...
}

/**
* Register a system with the given arguments.
* @param {SystemUpdateType} type - Type of the system update.
* @param {SystemModulePromise} systemModulePromise - System module promise.
* @param {A} args - Arguments for the system module.
* @internal
*/
export const registerSystemWithArgs = <A>(
  type: SystemUpdateType,
  systemModulePromise: SystemModulePromise<A>,
  args: A
) => {
  Engine.defaultWorld._pipeline.push({ type, systemModulePromise, args })
}

/**
* Register injected systems.
* @param type - Type of the injected systems.
* @param systems - List of injected systems.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
export const registerInjectedSystems = <A>(type: SystemUpdateType, systems: SystemModuleType<A>[]) => {
  Engine.defaultWorld._pipeline.push(...systems.filter((system) => system.type === type))
}
