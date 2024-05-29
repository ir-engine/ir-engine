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

import { useCallback, useEffect, useState } from 'react'

import { defineSystem, PresentationSystemGroup, SystemUUID } from '@etherealengine/ecs'
import {
  GraphJSON,
  GraphNodes,
  ILifecycleEventEmitter,
  IRegistry,
  readGraphFromJSON,
  VisualScriptEngine
} from '@etherealengine/visual-script'

/** Runs the visual script by building the execution
 * engine and triggering start on the lifecycle event emitter.
 */
let systemCounter = 0
let system: SystemUUID | undefined = undefined

export const getOnAsyncExecuteSystemUUID = () => ('visual-script-asyncExecute' + systemCounter) as SystemUUID
export const useVisualScriptRunner = ({
  visualScriptJson,
  autoRun = false,
  registry
}: {
  visualScriptJson: GraphJSON | undefined
  autoRun?: boolean
  registry: IRegistry
}) => {
  const [engine, setEngine] = useState<VisualScriptEngine>()
  const [run, setRun] = useState(autoRun)

  const play = useCallback(() => {
    setRun(true)
  }, [])

  const pause = useCallback(() => {
    setRun(false)
  }, [])

  const togglePlay = useCallback(() => {
    setRun((existing) => !existing)
  }, [])

  useEffect(() => {
    if (!visualScriptJson || !registry.values || !run || !registry.dependencies) return
    let visualScriptNodes: GraphNodes
    try {
      visualScriptNodes = readGraphFromJSON({
        graphJson: visualScriptJson,
        registry
      }).nodes
    } catch (e) {
      console.error(e)
      return
    }
    const engine = new VisualScriptEngine(visualScriptNodes)

    setEngine(engine)

    return () => {
      engine.dispose()
      setEngine(undefined)
    }
  }, [visualScriptJson, registry.values, run, registry.nodes, registry.dependencies])

  useEffect(() => {
    if (!engine || !run) return
    const eventEmitter = registry.dependencies?.ILifecycleEventEmitter as ILifecycleEventEmitter
    engine.executeAllSync()

    if (eventEmitter.startEvent.listenerCount === 0) {
      console.warn('No onStart Node found in graph.  Graph will not run.')
      return
    }
    eventEmitter.startEvent.emit()
    if (engine.asyncNodes.length) {
      if (system === undefined) {
        systemCounter++
        const systemUUID = defineSystem({
          uuid: getOnAsyncExecuteSystemUUID(),
          execute: () => {
            if (!engine || !run) return
            engine.executeAllAsync(500)
          },
          insert: { after: PresentationSystemGroup }
        })
        system = systemUUID
      }
    }
    return () => {
      if (system === undefined) return
      system = undefined // setting variable to undefined will destroy the system
    }
    // start up
  }, [engine, registry.dependencies?.ILifecycleEventEmitter, run])

  return {
    engine,
    playing: run,
    play,
    togglePlay,
    pause
  }
}
