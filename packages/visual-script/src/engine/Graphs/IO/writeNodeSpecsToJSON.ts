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

import { NodeCategory } from '../../Nodes/NodeDefinitions'
import { NodeConfigurationDescription } from '../../Nodes/Registry/NodeDescription'
import { IRegistry } from '../../Registry'
import { Choices } from '../../Sockets/Socket'
import { createNode, makeGraphApi } from '../Graph'
import { NodeConfigurationJSON, VariableJSON } from './GraphJSON'
import { ChoiceJSON, InputSocketSpecJSON, NodeSpecJSON, OutputSocketSpecJSON } from './NodeSpecJSON'
import { readVariablesJSON } from './readGraphFromJSON'

function toChoices(valueChoices: Choices | undefined): ChoiceJSON | undefined {
  return valueChoices?.map((choice) => {
    if (typeof choice === 'string') return { text: choice, value: choice }
    return choice
  })
}

// create JSON specs for a single node based on given configuration
export function writeNodeSpecToJSON(
  registry: IRegistry,
  nodeTypeName: string,
  configuration: NodeConfigurationJSON,
  variableJson?: VariableJSON[]
): NodeSpecJSON {
  const variables = readVariablesJSON(registry.values, variableJson ?? [])
  const graph = makeGraphApi({
    ...registry,
    customEvents: {},
    variables: variables
  })
  const node = createNode({
    graph,
    registry,
    nodeTypeName,
    nodeConfiguration: configuration
  })

  const nodeDefinition: any = registry.nodes[nodeTypeName]

  const nodeSpecJSON: NodeSpecJSON = {
    type: nodeTypeName,
    category: node.description.category as NodeCategory,
    label: node.description.label,
    inputs: [],
    outputs: [],
    configuration: []
  }
  if (nodeDefinition.configuration) {
    Object.entries(nodeDefinition.configuration as NodeConfigurationDescription).forEach(([configName, configSpec]) => {
      nodeSpecJSON.configuration.push({
        name: configName,
        valueType: configSpec.valueType,
        defaultValue: configSpec.defaultValue
      })
    })
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

  Object.entries(node.description.configuration).forEach(([configName, configSpec]) => {
    nodeSpecJSON.configuration.push({
      name: configName,
      valueType: configSpec.valueType,
      defaultValue: configSpec.defaultValue
    })
  })
  return nodeSpecJSON
}

// create JSON specs for all nodes with empty configuration
export function writeDefaultNodeSpecsToJSON(registry: IRegistry): NodeSpecJSON[] {
  const nodeSpecsJSON: NodeSpecJSON[] = []

  Object.keys(registry.nodes).forEach((nodeTypeName) => {
    nodeSpecsJSON.push(writeNodeSpecToJSON(registry, nodeTypeName, {}))
  })

  return nodeSpecsJSON
}
