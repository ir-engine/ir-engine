/** Functions to provide system level functionalities. */

import { SystemUpdateType } from '../functions/SystemUpdateType'
import { World } from '../classes/World'

export type CreateSystemFunctionType<A extends any> = (world: World, props?: A) => Promise<() => void>
export type SystemModule<A extends any> = { default: CreateSystemFunctionType<A> }
export type SystemModulePromise<A extends any> = Promise<SystemModule<A>>

export type SystemModuleType<A> = {
  systemModulePromise: SystemModulePromise<A>
  type: SystemUpdateType
  sceneSystem?: boolean
  args?: A
}

export type SystemFactoryType<A> = {
  systemModule: SystemModule<A>
  type: SystemUpdateType
  sceneSystem?: boolean
  args?: A
}

export type SystemInstanceType = {
  name: string
  type: SystemUpdateType
  sceneSystem: boolean
  execute: () => void
}

export const initSystems = async (world: World, systemModulesToLoad: SystemModuleType<any>[]) => {
  const loadSystemInjection = async (s: SystemFactoryType<any>) => {
    const system = await s.systemModule.default(world, s.args)
    return {
      name: s.systemModule.default.name,
      type: s.type,
      sceneSystem: s.sceneSystem,
      execute: () => {
        try {
          system()
        } catch (e) {
          console.error(e)
        }
      }
    } as SystemInstanceType
  }
  const systemModule = await Promise.all(
    systemModulesToLoad.map(async (s) => {
      return {
        args: s.args,
        type: s.type,
        sceneSystem: s.sceneSystem,
        systemModule: await s.systemModulePromise
      }
    })
  )
  const systems = await Promise.all(systemModule.map(loadSystemInjection))
  systems.forEach((s) => {
    world.pipelines[s.type].push(s)
    console.log(`${s.type} ${s.name}`)
  })
}
