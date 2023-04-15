import React, { Suspense } from 'react'

import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import multiLogger from '@etherealengine/common/src/logger'
import { ReactorProps, ReactorRoot, startReactor } from '@etherealengine/hyperflux'

import { nowMilliseconds } from '../../common/functions/nowMilliseconds'
import { Engine } from '../classes/Engine'
import { QueryComponents, useQuery } from './ComponentFunctions'
import { EntityReactorProps } from './EntityFunctions'

const logger = multiLogger.child({ component: 'engine:ecs:SystemFunctions' })

export type SystemUUID = OpaqueType<'SystemUUID'> & string
export interface System {
  uuid: SystemUUID | string
  execute: () => void // runs after preSystems, and before subSystems
  reactor: React.FC<ReactorProps>
  preSystems: SystemUUID[]
  subSystems: SystemUUID[]
  postSystems: SystemUUID[]
  enabled: boolean
  sceneSystem?: boolean
}

export const SystemDefintions = new Map<SystemUUID, System>()

const lastWarningTime = new Map<SystemUUID, number>()
const warningCooldownDuration = 1000 * 10 // 10 seconds

export let CurrentSystemUUID = null as SystemUUID | null

export function executeSystem(systemUUID: SystemUUID) {
  const system = SystemDefintions.get(systemUUID)!
  if (!system) {
    console.warn(`System ${systemUUID} does not exist.`)
    return
  }
  if (!system.enabled) return

  system.preSystems.forEach(executeSystem)

  const startTime = nowMilliseconds()
  try {
    CurrentSystemUUID = systemUUID
    system.execute()
  } catch (e) {
    logger.error(`Failed to execute system ${system.uuid}`)
    logger.error(e)
  } finally {
    CurrentSystemUUID = null
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

export function defineSystem(systemConfig: Partial<System> & { uuid: string }) {
  if (SystemDefintions.has(systemConfig.uuid as SystemUUID)) {
    throw new Error(`System ${systemConfig.uuid} already exists.`)
  }

  const system = {
    uuid: systemConfig.uuid as SystemUUID,
    reactor: systemConfig.reactor ?? null,
    enabled: systemConfig.enabled ?? false,
    preSystems: systemConfig.preSystems ?? [],
    execute: systemConfig.execute ?? (() => {}),
    subSystems: systemConfig.subSystems ?? [],
    postSystems: systemConfig.postSystems ?? [],
    sceneSystem: false
  } as Required<System>

  SystemDefintions.set(systemConfig.uuid as SystemUUID, system)

  return systemConfig.uuid as SystemUUID
}

export function startSystem(
  systemUUID: SystemUUID,
  insert: {
    before?: SystemUUID
    with?: SystemUUID
    after?: SystemUUID
  }
) {
  console.log('insertSystem', systemUUID, insert)
  const referenceSystem = SystemDefintions.get(systemUUID)
  if (!referenceSystem) throw new Error(`System ${systemUUID} does not exist.`)

  if (insert.before) {
    const referenceSystem = SystemDefintions.get(insert.before)
    if (!referenceSystem)
      throw new Error(
        `System ${insert.before} does not exist. You may have a circular dependency in your system definitions.`
      )
    referenceSystem.preSystems.push(systemUUID)
    enableSystem(systemUUID)
  }

  if (insert.with) {
    const referenceSystem = SystemDefintions.get(insert.with)
    if (!referenceSystem)
      throw new Error(
        `System ${insert.with} does not exist. You may have a circular dependency in your system definitions.`
      )
    referenceSystem.subSystems.push(systemUUID)
    enableSystem(systemUUID)
  }

  if (insert.after) {
    const referenceSystem = SystemDefintions.get(insert.after)
    if (!referenceSystem)
      throw new Error(
        `System ${insert.after} does not exist. You may have a circular dependency in your system definitions.`
      )
    referenceSystem.postSystems.push(systemUUID)
    enableSystem(systemUUID)
  }
}

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

export const enableSystem = (systemUUID: SystemUUID) => {
  const system = SystemDefintions.get(systemUUID)
  if (system) {
    // shouldn't this be an error if the system doesn't exist?
    const reactor = startReactor(system.reactor)
    Engine.instance.activeSystemReactors.set(system.uuid as SystemUUID, reactor)
    for (const preSystem of system.preSystems) {
      enableSystem(preSystem)
    }
    system.enabled = true
    for (const subSystem of system.subSystems) {
      enableSystem(subSystem)
    }
    for (const postSystem of system.postSystems) {
      enableSystem(postSystem)
    }
  }
}

export const disableSystem = async (systemUUID: SystemUUID) => {
  const system = SystemDefintions.get(systemUUID)
  if (system) {
    system.enabled = false
    const reactor = Engine.instance.activeSystemReactors.get(system.uuid as SystemUUID)!
    await reactor.stop()
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
