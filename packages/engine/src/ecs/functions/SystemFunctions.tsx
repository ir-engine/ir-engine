import React, { Suspense } from 'react'

import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import multiLogger from '@etherealengine/common/src/logger'
import { getMutableState, ReactorProps, ReactorRoot } from '@etherealengine/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { Engine } from '../classes/Engine'
import { EngineState } from '../classes/EngineState'
import { Entity } from '../classes/Entity'
import { defineQuery, EntityRemovedComponent, QueryComponents, useQuery } from './ComponentFunctions'
import { EntityReactorProps, removeEntity } from './EntityFunctions'

const logger = multiLogger.child({ component: 'engine:ecs:SystemFunctions' })

export type SystemUUID = OpaqueType<'SystemUUID'> & string
export interface System {
  uuid: string | SystemUUID
  reactor?: React.FC<ReactorProps> | null
  enabled?: boolean
  preSystems?: SystemUUID[]
  execute: () => void // runs after preSystems, and before subSystems
  subSystems?: SystemUUID[]
  postSystems?: SystemUUID[]
}

export type SystemInsertOrder = 'before' | 'with' | 'after'

const wrapExecute = (system: Required<System>) => {
  let lastWarningTime = 0
  const warningCooldownDuration = 1000 * 10 // 10 seconds

  return () => {
    for (const preSystem of system.preSystems) {
      const preSystemInstance = Engine.instance.systemDefinitions.get(preSystem)
      if (preSystemInstance) {
        preSystemInstance.execute()
      }
    }
    const startTime = nowMilliseconds()
    try {
      system.execute()
    } catch (e) {
      logger.error(`Failed to execute system ${system.uuid}`)
      logger.error(e)
    }
    const endTime = nowMilliseconds()
    const systemDuration = endTime - startTime
    if (systemDuration > 50 && lastWarningTime < endTime - warningCooldownDuration) {
      lastWarningTime = endTime
      logger.warn(`Long system execution detected. System: ${system.uuid} \n Duration: ${systemDuration}`)
    }
    for (const subSystem of system.subSystems) {
      const subSystemInstance = Engine.instance.systemDefinitions.get(subSystem)
      if (subSystemInstance) {
        subSystemInstance.execute()
      }
    }
    for (const postSystem of system.postSystems) {
      const postSystemInstance = Engine.instance.systemDefinitions.get(postSystem)
      if (postSystemInstance) {
        postSystemInstance.execute()
      }
    }
  }
}

export function defineSystem(systemConfig: Omit<System, 'preSystems' | 'postSystems'>) {
  if (Engine.instance.systemDefinitions.has(systemConfig.uuid)) {
    throw new Error(`System ${systemConfig.uuid} already exists.`)
  }

  const system = {
    uuid: systemConfig.uuid as SystemUUID,
    reactor: systemConfig.reactor ?? null,
    enabled: true,
    preSystems: [],
    execute: undefined!,
    subSystems: [],
    postSystems: []
  } as Required<System>

  system.execute = wrapExecute(system)

  Engine.instance.systemDefinitions.set(systemConfig.uuid, system)

  return systemConfig.uuid as SystemUUID
}

export function insertSystems(referenceUUIDs: SystemUUID[], insertOrder: SystemInsertOrder, systemUUID: SystemUUID) {
  for (const referenceUUID of referenceUUIDs) {
    const system = Engine.instance.systemDefinitions.get(referenceUUID)
    if (system) {
      if (insertOrder === 'before') {
        system.preSystems.push(systemUUID)
      } else if (insertOrder === 'after') {
        system.postSystems.push(systemUUID)
      } else if (insertOrder === 'with') {
        system.subSystems.push(systemUUID)
      }
    } else {
      throw new Error(
        `System ${referenceUUID} does not exist. You may have a circular dependency in your system definitions.`
      )
    }
  }
}
export const unloadAllSystems = () => {}

export const unloadSystems = (uuids: string[]) => {
  // const systemsToUnload = uuids.map((uuid) => Engine.instance.systemsByUUID[uuid])
  // const promises = [] as Promise<void>[]
  // for (const system of systemsToUnload) {
  //   const pipeline = Engine.instance.pipelines[system.type]
  //   const i = pipeline.indexOf(system)
  //   pipeline.splice(i, 1)
  //   delete Engine.instance.systemsByUUID[system.uuid]
  //   promises.push(system.cleanup())
  // }
  // return promises
}

export const unloadSystem = (uuid: string) => {
  // const systemToUnload = Engine.instance.systemsByUUID[uuid]
  // const pipeline = Engine.instance.pipelines[systemToUnload.type]
  // const i = pipeline.indexOf(systemToUnload)
  // pipeline.splice(i, 1)
  // delete Engine.instance.systemsByUUID[systemToUnload.uuid]
  // return systemToUnload.cleanup()
}

export const InputSystemGroup = defineSystem({
  uuid: 'ee.engine.input-group',
  execute: () => {}
  // subSystems: [] //'ee.engine.input']
})

export const SimulationSystemGroup = defineSystem({
  uuid: 'ee.engine.simulation-group',
  execute: () => {}
  // subSystems: [] //'ee.engine.avatar', 'ee.engine.physics']
})

export const PresentationSystemGroup = defineSystem({
  uuid: 'ee.engine.presentation-group',
  execute: () => {}
  // subSystems: [] //'ee.engine.render']
})

export const RootSystemGroup = defineSystem({
  uuid: 'ee.engine.root-group',
  execute: () => {}
  // subSystems: [InputSystemGroup, SimulationSystemGroup]
})

// todo, move to client only somehow maybe??
export const PostAvatarUpdateSystemGroup = defineSystem(
  {
    uuid: 'ee.engine.post-avatar-update-group',
    execute: () => {}
  }
  // { after: [AvatarSpawnSystem, SimulationSystemGroup] }
)

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

  const rootSystem = Engine.instance.systemDefinitions.get(RootSystemGroup)!
  rootSystem.execute()

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

export const createQueryReactor = (Components: QueryComponents, ChildEntityReactor: React.FC<EntityReactorProps>) => {
  if (!ChildEntityReactor.name) Object.defineProperty(ChildEntityReactor, 'name', { value: 'ChildEntityReactor' })
  return function HyperfluxQueryReactor({ root }: ReactorProps) {
    return <QueryReactor query={Components} ChildEntityReactor={ChildEntityReactor} root={root} />
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
