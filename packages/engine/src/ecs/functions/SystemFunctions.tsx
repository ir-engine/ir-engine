/** Functions to provide system level functionalities. */

import * as bitECS from 'bitecs'
import React from 'react'

import multiLogger from '@xrengine/common/src/logger'
import { ReactorProps, ReactorRoot, startReactor } from '@xrengine/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { World } from '../classes/World'
import {
  defineComponent,
  defineQuery,
  Query,
  removeComponent,
  removeQuery,
  setComponent,
  useQuery
} from './ComponentFunctions'
import { EntityReactorProps, EntityReactorRoot } from './EntityFunctions'
import { SystemUpdateType } from './SystemUpdateType'

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

const loadSubsystems = (
  world: World,
  parentSystemFactory: SystemFactoryType<any>,
  subsystems: Array<SystemLoader<any>> = []
) => {
  return Promise.all(
    subsystems.map(async (subsystemInit, i) => {
      const subsystem = await subsystemInit()
      const name = subsystem.default.name
      const uuid = name
      const type = 'SUB_SYSTEM' as any
      return {
        uuid,
        name,
        type,
        sceneSystem: parentSystemFactory.sceneSystem,
        enabled: true,
        ...(await loadSystemInjection(world, {
          systemModule: subsystem,
          uuid,
          type
        }))
      }
    })
  )
}

const loadSystemInjection = async (world: World, s: SystemFactoryType<any>, type?: SystemUpdateType, args?: any) => {
  const name = s.systemModule.default.name
  try {
    if (type) logger.info(`${name} initializing on ${type} pipeline`)
    else logger.info(`${name} initializing`)
    const system = await s.systemModule.default(world, args)
    logger.info(`${name} (${s.uuid}) ready`)
    const subsystems = loadSubsystems(world, s, system.subsystems)
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
      world.systemsByUUID[s.uuid] = s
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
  world.systemsByUUID[systemData.uuid] = systemData
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
      delete world.systemsByUUID[s.uuid]
    })
  })
}

export const unloadSystem = (world: World, uuid: string) => {
  const entries = Object.entries(world.pipelines)
  for (const [type, pipeline] of entries) {
    const system = pipeline.find((s) => s.uuid === uuid)
    if (system) {
      const i = pipeline.indexOf(system)
      pipeline.splice(i, 1)
      delete world.systemsByUUID[system.uuid]
      return
    }
  }
}

function QueryReactor(props: { root: ReactorRoot; query: Query; ChildEntityReactor: React.FC<EntityReactorProps> }) {
  const entities = useQuery(props.query)
  return (
    <>
      {entities.map((entity) => (
        <props.ChildEntityReactor key={entity} root={{ ...props.root, entity }} />
      ))}
    </>
  )
}

export const startQueryReactor = (
  components: (bitECS.Component | bitECS.QueryModifier)[],
  ChildEntityReactor: React.FC<EntityReactorProps>
) => {
  const query = defineQuery(components)
  return startReactor(({ root }: ReactorProps) => (
    <QueryReactor query={query} ChildEntityReactor={ChildEntityReactor} root={root} />
  ))
}
