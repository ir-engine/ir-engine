/** Functions to provide system level functionalities. */

import { SystemUpdateType } from '../functions/SystemUpdateType'
import { Engine } from '../classes/Engine'
import { System } from '../classes/System'
import { World } from '../classes/World'

export type CreateSystemFunctionType<A extends any> = (world: World, props?: A) => Promise<System>
export type SystemModule<A extends any> = { default: CreateSystemFunctionType<A> }
export type SystemModulePromise<A extends any> = Promise<SystemModule<A>>

export type SystemModuleType<A> = {
  systemModulePromise: SystemModulePromise<A>
  type: SystemUpdateType
  args?: A
}

export type SystemFactoryType<A> = {
  systemModule: SystemModule<A>
  type: SystemUpdateType
  args?: A
}

export const registerSystem = (type: SystemUpdateType, systemModulePromise: SystemModulePromise<any>) => {
  Engine.currentWorld!._pipeline.push({ type, systemModulePromise, args: undefined }) // yes undefined, V8...
}

export const registerSystemWithArgs = <A>(
  type: SystemUpdateType,
  systemModulePromise: SystemModulePromise<A>,
  args: A
) => {
  Engine.currentWorld!._pipeline.push({ type, systemModulePromise, args })
}

export const registerInjectedSystems = <A>(type: SystemUpdateType, systems: SystemModuleType<A>[]) => {
  Engine.currentWorld!._pipeline.push(...systems.filter((system) => system.type === type))
}
