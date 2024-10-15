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

import { Component, ComponentMap, defineQuery, removeQuery } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { NodeCategory, SocketsList, makeFunctionNodeDefinition, sequence } from '@ir-engine/visual-script'

export const getQuery = makeFunctionNodeDefinition({
  typeName: 'engine/query/get',
  category: NodeCategory.Engine,
  label: 'get Query',
  configuration: {
    numInputs: {
      valueType: 'number',
      defaultValue: 1
    }
  },
  in: (_, graphApi) => {
    const sockets: SocketsList = []

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
    // unsure how to get all system groups

    sockets.push({ ...type() })

    for (const index of sequence(1, (_.numInputs ?? getQuery.configuration?.numInputs.defaultValue) + 1)) {
      sockets.push({ ...componentName(index) })
    }
    return sockets
  },

  out: {
    entityList: 'list'
  },
  exec: ({ read, write, graph, configuration }) => {
    const type = read<string>('type')

    const queryComponents: Component[] = []
    for (const index of sequence(1, (configuration.numInputs ?? getQuery.configuration?.numInputs.defaultValue) + 1)) {
      const componentName = read<string>(`componentName${index}`)
      const component = ComponentMap.get(componentName)!
      queryComponents.push(component)
    }
    const query = defineQuery(queryComponents)[type]()
    write('entityList', query)
    removeQuery(query)
  }
})
