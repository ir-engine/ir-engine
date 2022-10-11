/** Functions to provide system level functionalities. */
import multiLogger from '@xrengine/common/src/logger'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { World } from '../classes/World'
import { SystemUpdateType } from '../functions/SystemUpdateType'

const logger = multiLogger.child({ component: 'engine:ecs:SystemFunctions' })

export type CreateSystemSyncFunctionType<A extends any> = (world: World, props?: A) => SystemDefintion
export type CreateSystemFunctionType<A extends any> = (world: World, props?: A) => Promise<SystemDefintion>
export type SystemModule<A extends any> = { default: CreateSystemFunctionType<A> }
export type SystemLoader<A extends any> = () => Promise<SystemModule<A>>

export interface SystemDefintion {
  execute: () => void
  cleanup: () => Promise<void>
  subsystems?: Array<SystemLoader<any>>
}

/** Internal */
interface SystemInstanceData {
  execute: () => void
  cleanup: () => Promise<void>
  subsystems: SystemInstanceData[]
}

export interface SystemInstance extends SystemInstanceData {
  name: string
  uuid: string
  type: SystemUpdateType
  sceneSystem: boolean
  enabled: boolean
  subsystems: SystemInstance[]
}

export type SystemSyncFunctionType<A> = {
  systemFunction: CreateSystemSyncFunctionType<A>
  uuid: string
  type: SystemUpdateType
  args?: A
}

export type SystemModuleType<A> = {
  systemLoader: SystemLoader<A>
  /** any string to uniquely identity this module - can be a uuidv4 or a string name */
  uuid: string
  type: SystemUpdateType
  sceneSystem?: boolean
  args?: A
}

export type SystemFactoryType<A> = {
  uuid: string
  systemModule: SystemModule<A>
  type: SystemUpdateType
  sceneSystem?: boolean
  args?: A
}

const createExecute = (system: SystemDefintion, subsystems: SystemInstanceData[], name: string, uuid: string) => {
  let lastWarningTime = 0
  const warningCooldownDuration = 1000 * 10 // 10 seconds

  return () => {
    const startTime = nowMilliseconds()
    try {
      system.execute()
    } catch (e) {
      logger.error(`Failed to execute system ${name}`)
      logger.error(e)
    }
    const endTime = nowMilliseconds()
    const systemDuration = endTime - startTime
    if (systemDuration > 50 && lastWarningTime < endTime - warningCooldownDuration) {
      lastWarningTime = endTime
      logger.warn(`Long system execution detected. System: ${name} \n Duration: ${systemDuration}`)
    }
    for (const sys of subsystems) {
      sys.execute()
    }
  }
}

const loadSystemInjection = async (world: World, s: SystemFactoryType<any>, type?: SystemUpdateType, args?: any) => {
  const name = s.systemModule.default.name
  try {
    if (type) logger.info(`${name} initializing on ${type} pipeline`)
    else logger.info(`${name} initializing`)
    const system = await s.systemModule.default(world, args)
    logger.info(`${name} (${s.uuid}) ready`)
    const subsystems = system.subsystems
      ? await Promise.all(
          system.subsystems.map(async (subsystemInit, i) => {
            const subsystem = await subsystemInit()
            const name = subsystem.default.name
            const uuid = name
            const type = 'SUB_SYSTEM' as any
            return {
              uuid,
              name,
              type,
              sceneSystem: s.sceneSystem,
              enabled: true,
              ...(await loadSystemInjection(world, {
                systemModule: subsystem,
                uuid,
                type
              }))
            }
          })
        )
      : []
    return {
      execute: createExecute(system, subsystems, name, s.uuid),
      cleanup: system.cleanup,
      subsystems
    } as SystemInstanceData
  } catch (e) {
    console.error(e)
    logger.error(new Error(`System ${name} (${s.uuid}) failed to initialize!`, { cause: e.stack }))
    return null
  }
}

export const initSystems = async (world: World, systemModulesToLoad: SystemModuleType<any>[]) => {
  const systemModule = await Promise.all(
    systemModulesToLoad.map(async (s) => {
      return {
        uuid: s.uuid,
        args: s.args,
        type: s.type,
        sceneSystem: s.sceneSystem,
        systemModule: await s.systemLoader()
      }
    })
  )
  const systems = await Promise.all(
    systemModule.map(async (s) => {
      return {
        uuid: s.uuid,
        name: s.systemModule.default.name,
        type: s.type,
        sceneSystem: s.sceneSystem,
        enabled: true,
        ...(await loadSystemInjection(world, s))
      }
    })
  )
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
    uuid: systemArgs.uuid,
    name,
    type: systemArgs.type,
    sceneSystem: false,
    enabled: true,
    execute: () => {
      const startTime = nowMilliseconds()
      try {
        system.execute()
      } catch (e) {
        logger.error(`Failed to execute system ${name} (${systemArgs.uuid})`)
        logger.error(e)
      }
      const endTime = nowMilliseconds()
      const systemDuration = endTime - startTime
      if (systemDuration > 50 && lastWarningTime < endTime - warningCooldownDuration) {
        lastWarningTime = endTime
        logger.warn(
          `Long system execution detected. System: ${name} (${systemArgs.uuid}) \n Duration: ${systemDuration}`
        )
      }
    },
    cleanup: system.cleanup,
    subsystems: []
  } as SystemInstance
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
