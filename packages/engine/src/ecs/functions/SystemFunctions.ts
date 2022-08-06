/** Functions to provide system level functionalities. */
import multiLogger from '@xrengine/common/src/logger'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { World } from '../classes/World'
import { SystemUpdateType } from '../functions/SystemUpdateType'

const logger = multiLogger.child({ component: 'engine:ecs:SystemFunctions' })

export type CreateSystemSyncFunctionType<A extends any> = (world: World, props?: A) => () => void
export type CreateSystemFunctionType<A extends any> = (world: World, props?: A) => Promise<() => void>
export type SystemModule<A extends any> = { default: CreateSystemFunctionType<A> }
export type SystemModulePromise<A extends any> = Promise<SystemModule<A>>

export type SystemSyncFunctionType<A> = {
  systemFunction: CreateSystemSyncFunctionType<A>
  type: SystemUpdateType
  args?: A
}

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
  enabled: boolean
  execute: () => void
}

export const initSystems = async (world: World, systemModulesToLoad: SystemModuleType<any>[]) => {
  const loadSystemInjection = async (s: SystemFactoryType<any>) => {
    const name = s.systemModule.default.name
    try {
      logger.info(`${name} initializing on ${s.type} pipeline`)
      const system = await s.systemModule.default(world, s.args)
      logger.info(`${name} ready`)
      let lastWarningTime = 0
      const warningCooldownDuration = 1000 * 10 // 10 seconds
      return {
        name,
        type: s.type,
        sceneSystem: s.sceneSystem,
        enabled: true,
        execute: () => {
          const startTime = nowMilliseconds()
          try {
            system()
          } catch (e) {
            logger.error(e.stack)
          }
          const endTime = nowMilliseconds()
          const systemDuration = endTime - startTime
          if (systemDuration > 50 && lastWarningTime < endTime - warningCooldownDuration) {
            lastWarningTime = endTime
            logger.warn(`Long system execution detected. System: ${name} \n Duration: ${systemDuration}`)
          }
        }
      } as SystemInstanceType
    } catch (e) {
      logger.error(new Error(`System ${name} failed to initialize!`, { cause: e.stack }))
      return null
    }
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
    if (s) {
      world.pipelines[s.type].push(s)
    }
  })
}

export const initSystemSync = (world: World, systemArgs: SystemSyncFunctionType<any>) => {
  const name = systemArgs.systemFunction.name
  logger.info(`${name} initializing on ${systemArgs.type} pipeline`)
  const system = systemArgs.systemFunction(world, systemArgs.args)
  logger.info(`${name} ready`)
  let lastWarningTime = 0
  const warningCooldownDuration = 1000 * 10 // 10 seconds
  const systemData = {
    name,
    type: systemArgs.type,
    sceneSystem: false,
    enabled: true,
    execute: () => {
      const startTime = nowMilliseconds()
      try {
        system()
      } catch (e) {
        logger.error(e)
      }
      const endTime = nowMilliseconds()
      const systemDuration = endTime - startTime
      if (systemDuration > 50 && lastWarningTime < endTime - warningCooldownDuration) {
        lastWarningTime = endTime
        logger.warn(`Long system execution detected. System: ${name} \n Duration: ${systemDuration}`)
      }
    }
  } as SystemInstanceType
  world.pipelines[systemData.type].push(systemData)
}

export const unloadSystems = (world: World, sceneSystemsOnly = false) => {
  Object.entries(world.pipelines).forEach(([type, pipeline]) => {
    const systemsToRemove: any[] = []
    pipeline.forEach((s) => {
      if (sceneSystemsOnly) {
        if (s.sceneSystem) systemsToRemove.push(s)
      } else {
        systemsToRemove.push(s)
      }
    })
    systemsToRemove.forEach((s) => {
      const i = pipeline.indexOf(s)
      pipeline.splice(i, 1)
    })
  })
}
