/** Functions to provide system level functionalities. */

import { SystemUpdateType } from '../functions/SystemUpdateType'
import { Engine } from '../classes/Engine'
import { System } from '../classes/System'
import { World } from '../classes/World'

export type CreateSystemFunctionType<A extends any> = (world: World, props: A) => Promise<System>

export type SystemInitializeType<A> = {
  type: SystemUpdateType
  system: CreateSystemFunctionType<A>
  args?: A
}

export interface SystemInjectionType<A> extends SystemInitializeType<A> {
  before?: CreateSystemFunctionType<A>
  after?: CreateSystemFunctionType<A>
}

export const registerSystem = <A>(type: SystemUpdateType, system: CreateSystemFunctionType<A>, args?: A) => {
  const world = Engine.defaultWorld
  const pipeline = type === SystemUpdateType.Free ? world._freePipeline : world._fixedPipeline
  pipeline.push({ type, system, args })
}

export const unregisterSystem = <A>(type: SystemUpdateType, system: CreateSystemFunctionType<A>, args?: A) => {
  const world = Engine.defaultWorld
  const pipeline = type === SystemUpdateType.Free ? world._freePipeline : world._fixedPipeline
  const idx = pipeline.findIndex((i) => {
    return i.system === system
  })
  pipeline.splice(idx, 1)
}

export const injectSystem = <A>(init: SystemInjectionType<A>) => {
  const world = Engine.defaultWorld
  const pipeline = init.type === SystemUpdateType.Free ? world._freePipeline : world._fixedPipeline
  if ('before' in init) {
    const idx = pipeline.findIndex((i) => {
      return i.system === init.before
    })
    delete init.before
    pipeline.splice(idx, 0, init)
  } else if ('after' in init) {
    const idx =
      pipeline.findIndex((i) => {
        return i.system === init.after
      }) + 1
    delete init.after
    pipeline.splice(idx, 0, init)
  }
}
