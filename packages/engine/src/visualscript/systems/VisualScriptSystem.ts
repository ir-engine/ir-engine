/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { matches, Validator } from 'ts-matches'

import { hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { defineAction, defineActionQueue, getState } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'

import { VisualScriptComponent } from '../VisualScriptModule'

export const VisualScriptActions = {
  execute: defineAction({
    type: 'ee.engine.VisualScript.EXECUTE',
    entity: matches.number as Validator<unknown, Entity>
  }),
  stop: defineAction({
    type: 'ee.engine.VisualScript.STOP',
    entity: matches.number as Validator<unknown, Entity>
  }),
  executeAll: defineAction({
    type: 'ee.engine.VisualScript.EXECUTEALL',
    entity: matches.number as Validator<unknown, Entity>
  }),
  stopAll: defineAction({
    type: 'ee.engine.VisualScript.STOPALL',
    entity: matches.number as Validator<unknown, Entity>
  })
}

export const visualScriptQuery = defineQuery([VisualScriptComponent])

const executeQueue = defineActionQueue(VisualScriptActions.execute.matches)
const stopQueue = defineActionQueue(VisualScriptActions.stop.matches)
const execute = () => {
  if (getState(EngineState).isEditor) return

  for (const action of executeQueue()) {
    const entity = action.entity
    if (hasComponent(entity, VisualScriptComponent)) setComponent(entity, VisualScriptComponent, { run: true })
  }

  for (const action of stopQueue()) {
    const entity = action.entity
    if (hasComponent(entity, VisualScriptComponent)) setComponent(entity, VisualScriptComponent, { run: false })
  }
}

const reactor = () => {
  /** @todo add back proper support for visual script */
  // useEffect(() => {
  //   VisualScriptState.registerProfile(registerEngineProfile, VisualScriptDomain.ECS)
  // }, [])
  return null
}

export const VisualScriptSystem = defineSystem({
  uuid: 'ee.engine.VisualScriptSystem',
  insert: { with: InputSystemGroup },
  execute,
  reactor
})
