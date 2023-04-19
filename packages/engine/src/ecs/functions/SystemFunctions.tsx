/** Functions to provide system level functionalities. */

import React, { Suspense, useEffect, useMemo } from 'react'

import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import multiLogger from '@etherealengine/common/src/logger'
import { ReactorProps, ReactorRoot, startReactor } from '@etherealengine/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { Engine } from '../classes/Engine'
import { Entity } from '../classes/Entity'
import { QueryComponents, useQuery } from './ComponentFunctions'
import { EntityReactorProps } from './EntityFunctions'

const logger = multiLogger.child({ component: 'engine:ecs:SystemFunctions' })

export type SystemUUID = OpaqueType<'SystemUUID'> & string
export interface System {
  uuid: SystemUUID
  execute: () => void // runs after preSystems, and before subSystems
  reactor: React.FC<ReactorProps>
  preSystems: SystemUUID[]
  subSystems: SystemUUID[]
  postSystems: SystemUUID[]
  sceneSystem?: boolean
}

export const SystemDefinitions = new Map<SystemUUID, System>()

const lastWarningTime = new Map<SystemUUID, number>()
const warningCooldownDuration = 1000 * 10 // 10 seconds

export function executeSystem(systemUUID: SystemUUID) {
  const system = SystemDefinitions.get(systemUUID)!
  if (!system) {
    console.warn(`System ${systemUUID} does not exist.`)
    return
  }

  if (!Engine.instance.activeSystems.has(systemUUID)) return

  system.preSystems.forEach(executeSystem)

  const startTime = nowMilliseconds()
  try {
    Engine.instance.currentSystemUUID = systemUUID
    system.execute()
  } catch (e) {
    logger.error(`Failed to execute system ${system.uuid}`)
    logger.error(e)
  } finally {
    Engine.instance.currentSystemUUID = '__null__' as SystemUUID
  }
  const endTime = nowMilliseconds()

  const systemDuration = endTime - startTime
  if (systemDuration > 50 && (lastWarningTime.get(systemUUID) ?? 0) < endTime - warningCooldownDuration) {
    lastWarningTime.set(systemUUID, endTime)
    logger.warn(`Long system execution detected. System: ${system.uuid} \n Duration: ${systemDuration}`)
  }

  system.subSystems.forEach(executeSystem)
  system.postSystems.forEach(executeSystem)
}

/**
 * Defines a system
 * @param systemConfig
 * @returns
 */
export function defineSystem(systemConfig: Partial<Omit<System, 'enabled' | 'uuid'>> & { uuid: string }) {
  if (SystemDefinitions.has(systemConfig.uuid as SystemUUID)) {
    throw new Error(`System ${systemConfig.uuid} already exists.`)
  }

  const system = {
    reactor: () => null,
    preSystems: [],
    execute: () => {},
    subSystems: [],
    postSystems: [],
    sceneSystem: false,
    ...systemConfig,
    uuid: systemConfig.uuid as SystemUUID, // make typescript happy
    enabled: false
  } as Required<System>

  SystemDefinitions.set(systemConfig.uuid as SystemUUID, system)

  return systemConfig.uuid as SystemUUID
}

/**
 * Inserts a system into the DAG, enabling it if it is not already enabled.
 * @param systemUUID
 * @param insert
 * @returns
 */
export function startSystem(
  systemUUID: SystemUUID,
  insert: {
    before?: SystemUUID
    with?: SystemUUID
    after?: SystemUUID
  }
) {
  console.log('insertSystem', systemUUID, insert)
  const referenceSystem = SystemDefinitions.get(systemUUID)
  if (!referenceSystem) throw new Error(`System ${systemUUID} does not exist.`)

  if (Engine.instance.activeSystems.has(systemUUID)) return

  if (insert.before) {
    const referenceSystem = SystemDefinitions.get(insert.before)
    if (!referenceSystem)
      throw new Error(
        `System ${insert.before} does not exist. You may have a circular dependency in your system definitions.`
      )
    if (!referenceSystem.preSystems.includes(systemUUID)) referenceSystem.preSystems.push(systemUUID)
    enableSystem(systemUUID)
  }

  if (insert.with) {
    const referenceSystem = SystemDefinitions.get(insert.with)
    if (!referenceSystem)
      throw new Error(
        `System ${insert.with} does not exist. You may have a circular dependency in your system definitions.`
      )
    if (!referenceSystem.subSystems.includes(systemUUID)) referenceSystem.subSystems.push(systemUUID)
    enableSystem(systemUUID)
  }

  if (insert.after) {
    const referenceSystem = SystemDefinitions.get(insert.after)
    if (!referenceSystem)
      throw new Error(
        `System ${insert.after} does not exist. You may have a circular dependency in your system definitions.`
      )
    if (!referenceSystem.postSystems.includes(systemUUID)) referenceSystem.postSystems.push(systemUUID)
    enableSystem(systemUUID)
  }
}

/**
 * Insert a multiple system into the DAG at the same place, enabling them if they are not already enabled.
 * @param systems
 * @param insert
 */
export const startSystems = (
  systems: SystemUUID[],
  insert: {
    before?: SystemUUID
    with?: SystemUUID
    after?: SystemUUID
  }
) => {
  for (const system of systems) {
    startSystem(system, insert)
  }
}

/**
 * Starts a system and disables it when the component unmounts.
 * @param system
 * @param insert
 */
export const useSystem = (
  system: SystemUUID,
  insert: {
    before?: SystemUUID
    with?: SystemUUID
    after?: SystemUUID
  }
) => {
  useEffect(() => {
    startSystem(system, insert)
    return () => {
      disableSystem(system)
    }
  }, [])
}

/**
 * Start systems and disables them when the component unmounts.
 * @param systems
 * @param insert
 */
export const useSystems = (
  systems: SystemUUID[],
  insert: {
    before?: SystemUUID
    with?: SystemUUID
    after?: SystemUUID
  }
) => {
  useEffect(() => {
    startSystems(systems, insert)
    return () => {
      disableSystems(systems)
    }
  }, [])
}

/**
 * Enables systems
 * @param systems
 */
export const enableSystems = (systems: SystemUUID[]) => {
  for (const system of systems) {
    enableSystem(system)
  }
}

/**
 * Enables a system
 * @param systemUUID
 */
export const enableSystem = (systemUUID: SystemUUID) => {
  const system = SystemDefinitions.get(systemUUID)
  if (!system) throw new Error(`System ${systemUUID} does not exist.`)

  for (const preSystem of system.preSystems) {
    enableSystem(preSystem)
  }

  Engine.instance.activeSystems.add(systemUUID)

  const reactor = startReactor(system.reactor)
  Engine.instance.activeSystemReactors.set(system.uuid as SystemUUID, reactor)

  for (const subSystem of system.subSystems) {
    enableSystem(subSystem)
  }

  for (const postSystem of system.postSystems) {
    enableSystem(postSystem)
  }
}

/**
 * Disables all systems
 */
export const disableAllSystems = () => {
  for (const systemUUID of SystemDefinitions.keys()) {
    disableSystem(systemUUID)
  }
}

/**
 * Disables systems
 * @param systemUUIDs
 */
export const disableSystems = (systemUUIDs: SystemUUID[]) => {
  for (const systemUUID of systemUUIDs) {
    disableSystem(systemUUID)
  }
}

/**
 * Disables a system
 * @param systemUUID
 * @todo Should this be async?
 */
export const disableSystem = (systemUUID: SystemUUID) => {
  const system = SystemDefinitions.get(systemUUID)
  if (!system) throw new Error(`System ${systemUUID} does not exist.`)

  for (const subSystem of system.subSystems) {
    disableSystem(subSystem)
  }

  Engine.instance.activeSystems.delete(systemUUID)
  const reactor = Engine.instance.activeSystemReactors.get(system.uuid as SystemUUID)!
  if (reactor) {
    Engine.instance.activeSystemReactors.delete(system.uuid as SystemUUID)
    reactor.stop()
  }

  for (const postSystem of system.postSystems) {
    disableSystem(postSystem)
  }

  for (const preSystem of system.preSystems) {
    disableSystem(preSystem)
  }
}

const QueryReactor = React.memo(
  (props: { root: ReactorRoot; entity: Entity; ChildEntityReactor: React.FC<EntityReactorProps> }) => {
    const entityRoot = useMemo(() => {
      return {
        ...props.root,
        entity: props.entity
      }
    }, [props.root, props.entity])
    return (
      <>
        <QueryReactorErrorBoundary>
          <Suspense fallback={null}>
            <props.ChildEntityReactor root={entityRoot} />
          </Suspense>
        </QueryReactorErrorBoundary>
      </>
    )
  }
)

export const createQueryReactor = (Components: QueryComponents, ChildEntityReactor: React.FC<EntityReactorProps>) => {
  if (!ChildEntityReactor.name) Object.defineProperty(ChildEntityReactor, 'name', { value: 'ChildEntityReactor' })
  const MemoChildEntityReactor = React.memo(ChildEntityReactor)
  return function HyperfluxQueryReactor({ root }: ReactorProps) {
    const entities = useQuery(Components)
    return (
      <>
        {entities.map((entity) => (
          <QueryReactor root={root} key={entity} entity={entity} ChildEntityReactor={MemoChildEntityReactor} />
        ))}
      </>
    )
  }
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

/** System template

const MySystemState = defineState({
  name: 'MySystemState',
  initial: () => {
    return {
    }
  }
})

const execute = () => {
  
}

const reactor = () => {
  useEffect(() => {
    return () => {

    }
  }, [])
  return null
}

export const MySystem = defineSystem({
  uuid: 'ee.engine.MySystem',
  execute,
  reactor
})

*/
