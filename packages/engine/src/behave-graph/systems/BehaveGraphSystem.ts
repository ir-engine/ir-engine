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

import { ILifecycleEventEmitter, ILogger, Registry } from 'behave-graph'
import { Validator, matches } from 'ts-matches'

import { defineAction, defineActionQueue, defineState } from '@etherealengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { BehaveGraphComponent, GraphDomainID } from '../components/BehaveGraphComponent'
import { RuntimeGraphComponent } from '../components/RuntimeGraphComponent'

export type BehaveGraphDomainType = {
  register: (registry: Registry, logger?: ILogger, ticker?: ILifecycleEventEmitter) => void
}

export type BehaveGraphSystemStateType = {
  domains: Record<GraphDomainID, BehaveGraphDomainType>
}

export const BehaveGraphSystemState = defineState({
  name: 'BehaveGraphSystemState',
  initial: {
    domains: {}
  } as BehaveGraphSystemStateType
})

export const BehaveGraphActions = {
  execute: defineAction({
    type: 'BehaveGraph.EXECUTE',
    entity: matches.number as Validator<unknown, Entity>
  }),
  stop: defineAction({
    type: 'BehaveGraph.STOP',
    entity: matches.number as Validator<unknown, Entity>
  })
}

const graphQuery = defineQuery([BehaveGraphComponent])
const runtimeQuery = defineQuery([RuntimeGraphComponent])

const executeQueue = defineActionQueue(BehaveGraphActions.execute.matches)
const stopQueue = defineActionQueue(BehaveGraphActions.stop.matches)
function execute() {
  for (const entity of runtimeQuery.enter()) {
    const runtimeComponent = getComponent(entity, RuntimeGraphComponent)
    runtimeComponent.ticker.startEvent.emit()
    runtimeComponent.engine.executeAllSync()
  }

  for (const entity of runtimeQuery()) {
    const runtimeComponent = getComponent(entity, RuntimeGraphComponent)
    runtimeComponent.ticker.tickEvent.emit()
    runtimeComponent.engine.executeAllSync()
  }

  for (const action of executeQueue()) {
    const entity = action.entity
    if (hasComponent(entity, RuntimeGraphComponent)) {
      removeComponent(entity, RuntimeGraphComponent)
    }
    addComponent(entity, RuntimeGraphComponent)
  }

  for (const action of stopQueue()) {
    const entity = action.entity
    removeComponent(entity, RuntimeGraphComponent)
  }
}

export const BehaveGraphSystem = defineSystem({
  uuid: 'ee.engine.BehaveGraphSystem',
  execute
})
