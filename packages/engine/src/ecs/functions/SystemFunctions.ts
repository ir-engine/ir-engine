/** Functions to provide system level functionalities. */

import { SystemUpdateType } from '../functions/SystemUpdateType'
import { Engine } from '../classes/Engine'
import { System } from '../classes/System'
import { World } from '../classes/World'

export type CreateSystemFunctionType<A extends any> = (world: World, props?: A) => Promise<System>
export type SystemModulePromise<A extends any> = Promise<{ default: CreateSystemFunctionType<A> }>

export type SystemFactoryType<A> = {
  system: SystemModulePromise<A>
  type: SystemUpdateType
  args?: A
}

export const registerSystem = (type: SystemUpdateType, system: SystemModulePromise<void>) => {
  Engine.defaultWorld._pipeline.push({ type, system, args: undefined }) // yes undefined, V8...
}

export const registerSystemWithArgs = <A>(type: SystemUpdateType, system: SystemModulePromise<A>, args: A) => {
  Engine.defaultWorld._pipeline.push({ type, system, args })
}

export const registerInjectedSystems = <A>(type: SystemUpdateType, systems: SystemFactoryType<A>[]) => {
  Engine.defaultWorld._pipeline.push(...systems.filter((system) => system.type === SystemUpdateType.FIXED))
}
