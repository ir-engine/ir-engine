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

import { Validator, matches } from 'ts-matches'

import { defineAction, defineActionQueue, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { useEffect } from 'react'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import { defineQuery, hasComponent, removeQuery, setComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { BehaveGraphComponent } from '../components/BehaveGraphComponent'
import { BehaveGraphState } from '../state/BehaveGraphState'

export const BehaveGraphActions = {
  execute: defineAction({
    type: 'BehaveGraph.EXECUTE',
    entity: matches.number as Validator<unknown, Entity>
  }),
  stop: defineAction({
    type: 'BehaveGraph.STOP',
    entity: matches.number as Validator<unknown, Entity>
  }),
  executeAll: defineAction({
    type: 'BehaveGraph.EXECUTEALL',
    entity: matches.number as Validator<unknown, Entity>
  }),
  stopAll: defineAction({
    type: 'BehaveGraph.STOPALL',
    entity: matches.number as Validator<unknown, Entity>
  })
}

export const graphQuery = defineQuery([BehaveGraphComponent])

const executeQueue = defineActionQueue(BehaveGraphActions.execute.matches)
const stopQueue = defineActionQueue(BehaveGraphActions.stop.matches)
const execute = () => {
  for (const action of executeQueue()) {
    const entity = action.entity
    if (hasComponent(entity, BehaveGraphComponent)) setComponent(entity, BehaveGraphComponent, { run: true })
  }

  for (const action of stopQueue()) {
    const entity = action.entity
    if (hasComponent(entity, BehaveGraphComponent)) setComponent(entity, BehaveGraphComponent, { run: false })
  }
}

const reactor = () => {
  const engineState = useHookstate(getMutableState(EngineState))
  const sceneState = useHookstate(getMutableState(SceneState))
  const behaveGraphState = useHookstate(getMutableState(BehaveGraphState))

  useEffect(() => {
    if (!engineState.sceneLoaded.value || engineState.isEditor.value) return

    const graphQuery = defineQuery([BehaveGraphComponent])

    for (const entity of graphQuery()) {
      setComponent(entity, BehaveGraphComponent, { run: true })
    }

    return () => {
      removeQuery(graphQuery)
    }
  }, [engineState.sceneLoaded, sceneState.sceneData])
  // run scripts when loaded a scene, joined a world, scene entity changed, scene data changed

  return null
}

export const BehaveGraphSystem = defineSystem({
  uuid: 'ee.engine.BehaveGraphSystem',
  execute,
  reactor
})
