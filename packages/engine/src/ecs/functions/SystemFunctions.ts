/** Functions to provide system level functionalities. */

import { SystemUpdateType } from '../functions/SystemUpdateType'
import { pipe, System } from '../../ecs/bitecs'

export type CreateSystemFunctionType<A extends any> = (props: A) => Promise<System>

export type SystemInitializeType<A> = {
  type: SystemUpdateType
  system: CreateSystemFunctionType<A>
  args?: A
  before?: CreateSystemFunctionType<A>
  after?: CreateSystemFunctionType<A>
}

const pipelines: {
  [SystemUpdateType.Fixed]: SystemInitializeType<any>[]
  [SystemUpdateType.Free]: SystemInitializeType<any>[]
  [SystemUpdateType.Network]: SystemInitializeType<any>[]
} = {
  [SystemUpdateType.Fixed]: [],
  [SystemUpdateType.Free]: [],
  [SystemUpdateType.Network]: []
}

export const registerSystem = <A>(type: SystemUpdateType, system: CreateSystemFunctionType<A>, args?: A) => {
  pipelines[type].push({ type, system, args })
}

export const unregisterSystem = <A>(type: SystemUpdateType, system: CreateSystemFunctionType<A>, args?: A) => {
  const idx = pipelines[type].findIndex((i) => {
    return i.system === system
  })
  pipelines[type].splice(idx, 1)
}

export const injectSystem = <A>(init: SystemInitializeType<A>) => {
  if ('before' in init) {
    const idx = pipelines[init.type].findIndex((i) => {
      return i.before === init.before
    })
    delete init.before
    pipelines[init.type].splice(idx, 0, init)
  } else if ('after' in init) {
    const idx =
      pipelines[init.type].findIndex((i) => {
        return i.after === init.after
      }) + 1
    delete init.after
    pipelines[init.type].splice(idx, 0, init)
  }
}

export const createPipeline = async (updateType: SystemUpdateType) => {
  let systems = []
  for (const { system, args } of pipelines[updateType]) {
    systems.push(await system(args))
  }
  return pipe(...systems)
}
