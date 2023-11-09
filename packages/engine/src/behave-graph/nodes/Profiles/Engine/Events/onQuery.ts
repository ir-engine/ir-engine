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

import { NodeCategory, SocketsList, makeEventNodeDefinition, sequence } from '@behave-graph/core'
import { Entity } from '../../../../../ecs/classes/Entity'
import {
  Component,
  ComponentMap,
  Query,
  defineQuery,
  removeQuery
} from '../../../../../ecs/functions/ComponentFunctions'
import { InputSystemGroup } from '../../../../../ecs/functions/EngineFunctions'
import {
  SystemDefinitions,
  SystemUUID,
  defineSystem,
  disableSystem,
  startSystem
} from '../../../../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../../../../transform/components/TransformComponent'

let systemCounter = 0

type State = {
  query: Query
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  query: undefined!,
  systemUUID: '' as SystemUUID
})

// very 3D specific.
export const OnQuery = makeEventNodeDefinition({
  typeName: 'engine/onQuery',
  category: NodeCategory.Event,
  label: 'On Query',
  configuration: {
    numInputs: {
      valueType: 'number',
      defaultValue: 1
    }
  },
  in: (_, graphApi) => {
    const sockets: SocketsList = []

    sockets.push({ key: 'entity', valueType: 'entity' })

    const componentName = (index) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      return {
        key: `componentName${index}`,
        valueType: 'string',
        choices: choices,
        defaultValue: TransformComponent.name
      }
    }
    const type = () => {
      const choices = ['enter', 'exit']
      return {
        key: 'type',
        valueType: 'string',
        choices: choices,
        defaultValue: choices[0]
      }
    }

    const system = () => {
      const systemDefinitions = Array.from(SystemDefinitions.keys()).map((key) => key as string)
      const groups = systemDefinitions.filter((key) => key.includes('group')).sort()
      const nonGroups = systemDefinitions.filter((key) => !key.includes('group')).sort()
      const choices = [...groups, ...nonGroups]
      return {
        key: 'system',
        valueType: 'string',
        choices: choices,
        defaultValue: InputSystemGroup
      }
    }
    // unsure how to get all system groups

    sockets.push({ ...type() }, { ...system() })

    for (const index of sequence(1, (_.numInputs ?? OnQuery.configuration?.numInputs.defaultValue) + 1)) {
      sockets.push({ ...componentName(index) })
    }
    return sockets
  },

  out: {
    flow: 'flow',
    entity: 'entity'
  },
  initialState: initialState(),
  init: ({ read, write, commit, graph, configuration }) => {
    const type = read<string>('type')
    const system = read<SystemUUID>('system')

    const queryComponents: Component[] = []
    for (const index of sequence(1, (configuration.numInputs ?? OnQuery.configuration?.numInputs.defaultValue) + 1)) {
      const componentName = read<string>(`componentName${index}`)
      const component = ComponentMap.get(componentName)!
      queryComponents.push(component)
    }
    const query = defineQuery(queryComponents)[type]
    let prevQueryResult = []
    let newQueryResult = []
    const systemUUID = defineSystem({
      uuid: 'behave-graph-onQuery-' + systemCounter++,
      execute: () => {
        newQueryResult = query()
        if (newQueryResult.length === 0) return
        if (prevQueryResult === newQueryResult) return
        const tempResult = newQueryResult
        const entity = read<Entity>('entity')
        function delayedIteration(i) {
          if (i < tempResult.length) {
            if (entity) {
              if (tempResult[i] != entity) {
                delayedIteration(i + 1)
                return
              }
              console.log('hello found comparing against an entity', entity, tempResult[i])
            }
            write('entity', tempResult[i])
            commit('flow', () => {
              delayedIteration(i + 1)
            })
          }
        }
        // Start the delayed iteration
        delayedIteration(0)
        prevQueryResult = tempResult
      }
    })
    startSystem(systemUUID, { with: system })
    const state: State = {
      query,
      systemUUID
    }

    return state
  },
  dispose: ({ state: { query, systemUUID }, graph: { getDependency } }) => {
    disableSystem(systemUUID)
    removeQuery(query)
    return initialState()
  }
})
