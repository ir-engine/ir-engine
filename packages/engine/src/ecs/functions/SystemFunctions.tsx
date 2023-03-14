/** Functions to provide system level functionalities. */

import React, { Suspense } from 'react'

import multiLogger from '@etherealengine/common/src/logger'
import { getMutableState, ReactorProps, ReactorRoot, startReactor } from '@etherealengine/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { Engine } from '../classes/Engine'
import { EngineState } from '../classes/EngineState'
import { Entity } from '../classes/Entity'
import { defineQuery, EntityRemovedComponent, Query, QueryComponents, useQuery } from './ComponentFunctions'
import { EntityReactorProps, removeEntity } from './EntityFunctions'
import { SystemUpdateType } from './SystemUpdateType'

const logger = multiLogger.child({ component: 'engine:ecs:SystemFunctions' })

export type CreateSystemSyncFunctionType<A extends any> = (props?: A) => SystemDefintion
export type CreateSystemFunctionType<A extends any> = (props?: A) => Promise<SystemDefintion>
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
  before?: string
  after?: string
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
  /** @todo replace this with a more robust identifier */
  before?: string
  after?: string
  args?: A
}

export type SystemFactoryType<A> = {
  uuid: string
  systemModule: SystemModule<A>
  type: SystemUpdateType
  before?: string
  after?: string
  sceneSystem?: boolean
  args?: A
}

const TimerConfig = {
  MAX_DELTA_SECONDS: 1 / 10
}

const entityRemovedQuery = defineQuery([EntityRemovedComponent])

/**
 * Execute systems on this world
 *
 * @param frameTime the current frame time in milliseconds (DOMHighResTimeStamp) relative to performance.timeOrigin
 */
export const executeSystems = (frameTime: number) => {
  const engineState = getMutableState(EngineState)
  engineState.frameTime.set(frameTime)

  const start = nowMilliseconds()
  const incomingActions = [...Engine.instance.store.actions.incoming]

  const worldElapsedSeconds = (frameTime - Engine.instance.startTime) / 1000
  engineState.deltaSeconds.set(
    Math.max(0.001, Math.min(TimerConfig.MAX_DELTA_SECONDS, worldElapsedSeconds - Engine.instance.elapsedSeconds))
  )
  engineState.elapsedSeconds.set(worldElapsedSeconds)

  for (const system of Engine.instance.pipelines[SystemUpdateType.UPDATE_EARLY]) system.enabled && system.execute()
  for (const system of Engine.instance.pipelines[SystemUpdateType.UPDATE]) system.enabled && system.execute()
  for (const system of Engine.instance.pipelines[SystemUpdateType.UPDATE_LATE]) system.enabled && system.execute()
  for (const system of Engine.instance.pipelines[SystemUpdateType.PRE_RENDER]) system.enabled && system.execute()
  for (const system of Engine.instance.pipelines[SystemUpdateType.RENDER]) system.enabled && system.execute()
  for (const system of Engine.instance.pipelines[SystemUpdateType.POST_RENDER]) system.enabled && system.execute()

  for (const entity of entityRemovedQuery()) removeEntity(entity as Entity, true)

  for (const { query, result } of Engine.instance.reactiveQueryStates) {
    const entitiesAdded = query.enter().length
    const entitiesRemoved = query.exit().length
    if (entitiesAdded || entitiesRemoved) {
      result.set(query())
    }
  }

  const end = nowMilliseconds()
  const duration = end - start
  if (duration > 150) {
    logger.warn(`Long frame execution detected. Duration: ${duration}. \n Incoming actions: %o`, incomingActions)
  }
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

const loadSubsystems = (parentSystemFactory: SystemFactoryType<any>, subsystems: Array<SystemLoader<any>> = []) => {
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
        ...(await loadSystemInjection({
          systemModule: subsystem,
          uuid,
          type
        }))
      }
    })
  )
}

const loadSystemInjection = async (s: SystemFactoryType<any>, type?: SystemUpdateType, args?: any) => {
  const name = s.systemModule.default.name
  try {
    if (type) logger.info(`${name} initializing on ${type} pipeline`)
    else logger.info(`${name} initializing`)
    const system = await s.systemModule.default(args)
    const subsystems = await loadSubsystems(s, system.subsystems)
    logger.info(`${name} (${s.uuid}) ready`)
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

export const initSystems = async (systemModulesToLoad: SystemModuleType<any>[]) => {
  const systemModule = await Promise.all(
    systemModulesToLoad.map(async (s) => {
      return {
        uuid: s.uuid,
        args: s.args,
        type: s.type,
        before: s.before,
        after: s.after,
        sceneSystem: s.sceneSystem,
        systemModule: await s.systemLoader()
      } as SystemFactoryType<any>
    })
  )
  const systems = await Promise.all(
    systemModule.map(async (s) => {
      return {
        uuid: s.uuid,
        name: s.systemModule.default.name,
        type: s.type,
        before: s.before,
        after: s.after,
        sceneSystem: s.sceneSystem,
        enabled: true,
        ...(await loadSystemInjection(s))
      } as SystemInstance
    })
  )
  systems.forEach((s) => {
    if (s) {
      Engine.instance.systemsByUUID[s.uuid] = s
      if (s.before) {
        const index = Engine.instance.pipelines[s.type].findIndex((system) => system.uuid === s.before)
        if (index === -1) throw new Error(`System with id ${s.before} could not be found in pipeline ${s.type}`)
        Engine.instance.pipelines[s.type].splice(index, 0, s)
      } else if (s.after) {
        const index = Engine.instance.pipelines[s.type].findIndex((system) => system.uuid === s.after)
        if (index === -1) throw new Error(`System with id ${s.after} could not be found in pipeline ${s.type}`)
        Engine.instance.pipelines[s.type].splice(index + 1, 0, s)
      } else {
        Engine.instance.pipelines[s.type].push(s)
      }
    }
  })
}

export const initSystemSync = (systemArgs: SystemSyncFunctionType<any>) => {
  const name = systemArgs.systemFunction.name
  logger.info(`${name} initializing on ${systemArgs.type} pipeline`)
  const system = systemArgs.systemFunction(systemArgs.args)
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
  Engine.instance.systemsByUUID[systemData.uuid] = systemData
  Engine.instance.pipelines[systemData.type].push(systemData)
}

export const unloadAllSystems = (sceneSystemsOnly = false) => {
  const promises = [] as Promise<void>[]
  Object.entries(Engine.instance.pipelines).forEach(([type, pipeline]) => {
    const systemsToRemove: SystemInstance[] = []
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
      delete Engine.instance.systemsByUUID[s.uuid]
      promises.push(s.cleanup())
      const cleanupSubsystems = (subsystems: SystemInstance[]) => {
        for (const subsystem of subsystems) {
          delete Engine.instance.systemsByUUID[subsystem.uuid]
          promises.push(subsystem.cleanup())
          cleanupSubsystems(subsystem.subsystems)
        }
      }
      cleanupSubsystems(s.subsystems)
    })
  })
  return promises
}

export const unloadSystems = (uuids: string[]) => {
  const systemsToUnload = uuids.map((uuid) => Engine.instance.systemsByUUID[uuid])
  const promises = [] as Promise<void>[]
  for (const system of systemsToUnload) {
    const pipeline = Engine.instance.pipelines[system.type]
    const i = pipeline.indexOf(system)
    pipeline.splice(i, 1)
    delete Engine.instance.systemsByUUID[system.uuid]
    promises.push(system.cleanup())
  }
  return promises
}

export const unloadSystem = (uuid: string) => {
  const systemToUnload = Engine.instance.systemsByUUID[uuid]
  const pipeline = Engine.instance.pipelines[systemToUnload.type]
  const i = pipeline.indexOf(systemToUnload)
  pipeline.splice(i, 1)
  delete Engine.instance.systemsByUUID[systemToUnload.uuid]
  return systemToUnload.cleanup()
}

function QueryReactor(props: {
  root: ReactorRoot
  query: QueryComponents
  ChildEntityReactor: React.FC<EntityReactorProps>
}) {
  const entities = useQuery(props.query)
  return (
    <>
      {entities.map((entity) => (
        <QueryReactorErrorBoundary key={entity}>
          <Suspense fallback={null}>
            <props.ChildEntityReactor root={{ ...props.root, entity }} />
          </Suspense>
        </QueryReactorErrorBoundary>
      ))}
    </>
  )
}

export const startQueryReactor = (Components: QueryComponents, ChildEntityReactor: React.FC<EntityReactorProps>) => {
  if (!ChildEntityReactor.name) Object.defineProperty(ChildEntityReactor, 'name', { value: 'ChildEntityReactor' })
  return startReactor(function HyperfluxQueryReactor({ root }: ReactorProps) {
    return <QueryReactor query={Components} ChildEntityReactor={ChildEntityReactor} root={root} />
  })
}

interface ErrorState {
  error: Error | null
}

class QueryReactorErrorBoundary extends React.Component<any, ErrorState> {
  public state: ErrorState = {
    error: null
  }

  public static getDerivedStateFromError(error: Error): ErrorState {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    return this.state.error ? null : this.props.children
  }
}
