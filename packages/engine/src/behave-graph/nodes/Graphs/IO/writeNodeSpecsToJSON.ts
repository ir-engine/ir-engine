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

import { NodeCategory } from '../../Nodes/NodeDefinitions.js'
import { IRegistry } from '../../Registry.js'
import { Choices } from '../../Sockets/Socket.js'
import { createNode, makeGraphApi } from '../Graph.js'
import { ChoiceJSON, InputSocketSpecJSON, NodeSpecJSON, OutputSocketSpecJSON } from './NodeSpecJSON.js'

function toChoices(valueChoices: Choices | undefined): ChoiceJSON | undefined {
  return valueChoices?.map((choice) => {
    if (typeof choice === 'string') return { text: choice, value: choice }
    return choice
  })
}

export function writeNodeSpecsToJSON(registry: IRegistry): NodeSpecJSON[] {
  const nodeSpecsJSON: NodeSpecJSON[] = []

  // const graph = new Graph(registry);

  const graph = makeGraphApi({
    ...registry,
    customEvents: {},
    variables: {}
  })

  Object.keys(registry.nodes).forEach((nodeTypeName) => {
    const node = createNode({
      graph,
      registry,
      nodeTypeName
    })

    const nodeSpecJSON: NodeSpecJSON = {
      type: nodeTypeName,
      category: node.description.category as NodeCategory,
      label: node.description.label,
      inputs: [],
      outputs: [],
      configuration: []
    }

    node.inputs.forEach((inputSocket) => {
      const valueType = inputSocket.valueTypeName === 'flow' ? undefined : registry.values[inputSocket.valueTypeName]

      let defaultValue = inputSocket.value
      if (valueType !== undefined) {
        defaultValue = valueType.serialize(defaultValue)
      }
      if (defaultValue === undefined && valueType !== undefined) {
        defaultValue = valueType.serialize(valueType.creator())
      }
      const socketSpecJSON: InputSocketSpecJSON = {
        name: inputSocket.name,
        valueType: inputSocket.valueTypeName,
        defaultValue,
        choices: toChoices(inputSocket.valueChoices)
      }
      nodeSpecJSON.inputs.push(socketSpecJSON)
    })

    node.outputs.forEach((outputSocket) => {
      const socketSpecJSON: OutputSocketSpecJSON = {
        name: outputSocket.name,
        valueType: outputSocket.valueTypeName
      }
      nodeSpecJSON.outputs.push(socketSpecJSON)
    })

    nodeSpecsJSON.push(nodeSpecJSON)
  })

  return nodeSpecsJSON
}
