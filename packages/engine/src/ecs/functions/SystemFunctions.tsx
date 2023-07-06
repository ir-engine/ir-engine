/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

/** Functions to provide system level functionalities. */

import React, { Component, ErrorInfo, FC, memo, Suspense, useEffect, useMemo } from 'react'

import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import multiLogger from '@etherealengine/common/src/logger'
import { getState, ReactorRoot, startReactor } from '@etherealengine/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { Engine } from '../classes/Engine'
import { EngineState } from '../classes/EngineState'
import { Entity, UndefinedEntity } from '../classes/Entity'
import { QueryComponents, useQuery } from './ComponentFunctions'
import { EntityContext } from './EntityFunctions'

const logger = multiLogger.child({ component: 'engine:ecs:SystemFunctions' })

export type SystemUUID = OpaqueType<'SystemUUID'> & string
export interface System {
  uuid: SystemUUID
  reactor: FC
  preSystems: SystemUUID[]
  /** runs after preSystems, and before subSystems */
  execute: () => void
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

  if (getState(EngineState).systemPerformanceProfilingEnabled) {
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
  } else {
    try {
      Engine.instance.currentSystemUUID = systemUUID
      system.execute()
    } catch (e) {
      logger.error(`Failed to execute system ${system.uuid}`)
      logger.error(e)
    } finally {
      Engine.instance.currentSystemUUID = '__null__' as SystemUUID
    }
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

const QuerySubReactor = memo((props: { entity: Entity; ChildEntityReactor: FC }) => {
  return (
    <>
      <QueryReactorErrorBoundary>
        <Suspense fallback={null}>
          <EntityContext.Provider value={props.entity}>
            <props.ChildEntityReactor />
          </EntityContext.Provider>
        </Suspense>
      </QueryReactorErrorBoundary>
    </>
  )
})

export const QueryReactor = memo((props: { Components: QueryComponents; ChildEntityReactor: FC }) => {
  const entities = useQuery(props.Components)
  const MemoChildEntityReactor = useMemo(() => memo(props.ChildEntityReactor), [props.ChildEntityReactor])
  return (
    <>
      {entities.map((entity) => (
        <QuerySubReactor key={entity} entity={entity} ChildEntityReactor={MemoChildEntityReactor} />
      ))}
    </>
  )
})

/**
 * @deprecated use QueryReactor directly
 */
export const createQueryReactor = (Components: QueryComponents, ChildEntityReactor: FC) => {
  return () => <QueryReactor Components={Components} ChildEntityReactor={ChildEntityReactor} />
}

interface ErrorState {
  error: Error | null
}

class QueryReactorErrorBoundary extends Component<any, ErrorState> {
  public state: ErrorState = {
    error: null
  }

  public static getDerivedStateFromError(error: Error): ErrorState {
    // Update state so the next render will show the fallback UI.
    return { error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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
