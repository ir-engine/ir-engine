/** Functions to provide system level functionalities. */

import { SystemUpdateType } from '../functions/SystemUpdateType'
import { useEngine } from '../classes/Engine'
import { System } from '../classes/System'
import { World } from '../classes/World'

export type CreateSystemFunctionType<A extends any> = (world: World, props?: A) => Promise<System>
export type SystemModule<A extends any> = { default: CreateSystemFunctionType<A> }
export type SystemModulePromise<A extends any> = Promise<SystemModule<A>>

export type SystemModuleType<A> = {
  systemModulePromise: SystemModulePromise<A>
  type: SystemUpdateType
  sceneSystem: boolean
  args?: A
}

export type SystemFactoryType<A> = {
  systemModule: SystemModule<A>
  type: SystemUpdateType
  sceneSystem: boolean
  args?: A
}

export const registerSystem = (
  type: SystemUpdateType,
  systemModulePromise: SystemModulePromise<any>,
  sceneSystem = false
) => {
  useEngine().defaultWorld._pipeline.push({ type, systemModulePromise, sceneSystem, args: undefined }) // yes undefined, V8...
}

export const registerSystemWithArgs = <A>(
  type: SystemUpdateType,
  systemModulePromise: SystemModulePromise<A>,
  args: A,
  sceneSystem = false
) => {
  useEngine().defaultWorld._pipeline.push({ type, systemModulePromise, args, sceneSystem })
}
