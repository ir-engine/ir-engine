/** Functions to provide system level functionalities. */

import { SystemUpdateType } from '../functions/SystemUpdateType'
import { Engine } from '../classes/Engine'
import { System } from '../classes/System'
import { World } from '../classes/World'

export type CreateSystemFunctionType<A extends any> = (world: World, props?: A) => Promise<System>
export type SystemModulePromise<A extends any> = Promise<{ default: CreateSystemFunctionType<A> }>

export const InjectionPoint = {
  UPDATE: 'UPDATE' as const,
  FIXED_EARLY: 'FIXED_EARLY' as const,
  FIXED: 'FIXED' as const,
  FIXED_LATE: 'FIXED_LATE' as const,
  PRE_RENDER: 'PRE_RENDER' as const,
  POST_RENDER: 'POST_RENDER' as const
}

export type SystemInitializeType<A> = {
  system: SystemModulePromise<A>
  type?: SystemUpdateType
  args?: A
}

export interface SystemInjectionType<A> extends SystemInitializeType<A> {
  injectionPoint?: keyof typeof InjectionPoint
}

export const registerSystem = (type: SystemUpdateType, system: SystemModulePromise<void>) => {
  const world = Engine.defaultWorld
  const pipeline = type === SystemUpdateType.Free ? world._freePipeline : world._fixedPipeline
  pipeline.push({ type, system, args: undefined }) // yes undefined, V8...
}

export const registerSystemWithArgs = <A>(type: SystemUpdateType, system: SystemModulePromise<A>, args: A) => {
  const world = Engine.defaultWorld
  const pipeline = type === SystemUpdateType.Free ? world._freePipeline : world._fixedPipeline
  pipeline.push({ type, system, args })
}

export const unregisterSystem = <A>(type: SystemUpdateType, system: SystemModulePromise<A>, args?: A) => {
  const world = Engine.defaultWorld
  const pipeline = type === SystemUpdateType.Free ? world._freePipeline : world._fixedPipeline
  const idx = pipeline.findIndex((i) => {
    return i.system === system
  })
  pipeline.splice(idx, 1)
}

export const injectSystem = <A>(world: World, init: SystemInjectionType<A>) => {
  world._injectedPipelines[init.injectionPoint].push({ system: init.system, args: init.args })
}
