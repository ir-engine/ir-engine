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
import { Component } from 'bitecs'
import { ComponentMap, Query, defineQuery, removeQuery } from '../../../../../ecs/functions/ComponentFunctions'

let systemCounter = 0

type State = {
  query: Query
  //systemUUID: SystemUUID
}
const initialState = (): State => ({
  query: undefined!
  //systemUUID: '' as SystemUUID
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
  in: (configuration, graphApi) => {
    const sockets: SocketsList = []

    const componentName = (index) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      choices.unshift('none')
      return {
        key: `componentName${index}`,
        valueType: 'string',
        choices: choices
      }
    }
    const type = () => {
      const choices = ['entry', 'exit']
      choices.unshift('none')
      return {
        key: 'type',
        valueType: 'string',
        choices: choices
      }
    }

    /*const systemGroup = () => {
      const choices  = [] 
      choices.unshift('none')
      return {
        key: 'type',
        valueType: 'string',
        choices: choices
      }
    }*/
    // unsure how to get all system groups

    sockets.push({ ...type() })

    for (const index of sequence(1, configuration.numInputs + 1)) {
      sockets.push({ ...componentName(index) })
    }
    console.log('DEBUG sockets', sockets)
    return sockets
  },

  out: {
    flow: 'flow',
    entity: 'entity'
  },
  initialState: initialState(),
  init: ({ read, write, commit, graph, configuration }) => {
    const type = read<string>('type')
    const queryComponents: Component[] = []
    for (const index of sequence(1, configuration.numInputs + 1)) {
      const componentName = read<string>(`componentName${index}`)
      const component = ComponentMap.get(componentName)!
      queryComponents.push(component)
    }
    const query = defineQuery(queryComponents)
    //startSystem(systemUUID, { with: InputSystemGroup })
    const state: State = {
      query
      //systemUUID
    }

    return state
  },
  dispose: ({ state: { query }, graph: { getDependency } }) => {
    //disableSystem(systemUUID)
    removeQuery(query)
    return initialState()
  }
})
