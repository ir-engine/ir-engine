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

import { IRegistry } from '../../Registry'
import { GraphInstance } from '../Graph'
import {
  CustomEventJSON,
  CustomEventParameterJSON,
  GraphJSON,
  LinkJSON,
  NodeJSON,
  NodeParameterJSON,
  ValueJSON,
  VariableJSON
} from './GraphJSON'

export function writeGraphToJSON(graph: GraphInstance, registry: IRegistry): GraphJSON {
  const graphJson: GraphJSON = {}

  if (Object.keys(graph.metadata).length > 0) {
    graphJson.metadata = graph.metadata
  }

  // save custom events
  Object.values(graph.customEvents).forEach((customEvent) => {
    const customEventJson: CustomEventJSON = {
      name: customEvent.name,
      id: customEvent.id
    }
    if (customEvent.label.length > 0) {
      customEventJson.label = customEvent.label
    }
    if (customEvent.parameters.length > 0) {
      const parametersJson: CustomEventParameterJSON[] = []
      customEvent.parameters.forEach((parameter) => {
        parametersJson.push({
          name: parameter.name,
          valueTypeName: parameter.valueTypeName,
          defaultValue: parameter.value
        })
      })
      customEventJson.parameters = parametersJson
    }
    if (Object.keys(customEvent.metadata).length > 0) {
      customEventJson.metadata = customEvent.metadata
    }
    if (graphJson.customEvents === undefined) {
      graphJson.customEvents = []
    }
    graphJson.customEvents.push(customEventJson)
  })

  // save variables
  Object.values(graph.variables).forEach((variable) => {
    const variableJson: VariableJSON = {
      valueTypeName: variable.valueTypeName,
      name: variable.name,
      id: variable.id,
      initialValue: registry.values[variable.valueTypeName]?.serialize(variable.initialValue)
    }
    if (variable.label.length > 0) {
      variableJson.label = variable.label
    }
    if (Object.keys(variable.metadata).length > 0) {
      variableJson.metadata = variable.metadata
    }
    if (graphJson.variables === undefined) {
      graphJson.variables = []
    }
    graphJson.variables.push(variableJson)
  })

  // save nodes
  Object.entries(graph.nodes).forEach(([id, node]) => {
    const nodeJson: NodeJSON = {
      type: node.description.typeName,
      id
    }
    if (node.label && node.label.length > 0) {
      nodeJson.label = node.label
    }
    if (Object.keys(node.metadata).length > 0) {
      nodeJson.metadata = node.metadata
    }
    if (Object.keys(node.description.configuration).length > 0) {
      const configurationJson: { [key: string]: ValueJSON } = {}
      Object.keys(node.configuration).forEach((key) => {
        configurationJson[key] = node.configuration[key]
      })
      nodeJson.configuration = configurationJson
    }

    const parametersJson: NodeJSON['parameters'] = {}
    node.inputs.forEach((inputSocket) => {
      if (inputSocket.valueTypeName === 'flow') return

      let parameterJson: NodeParameterJSON | undefined = undefined

      if (inputSocket.links.length === 0) {
        parameterJson = {
          value: registry.values[inputSocket.valueTypeName]?.serialize(inputSocket.value)
        }
      } else if (inputSocket.links.length === 1) {
        const link = inputSocket.links[0]
        parameterJson = {
          link: {
            nodeId: link.nodeId,
            socket: link.socketName
          }
        }
      } else {
        throw new Error(`should not get here, inputSocket.links.length = ${inputSocket.links.length} > 1`)
      }
      parametersJson[inputSocket.name] = parameterJson
    })

    if (Object.keys(parametersJson).length > 0) {
      nodeJson.parameters = parametersJson
    }

    const flowsJson: { [output: string]: LinkJSON } = {}
    node.outputs.forEach((outputSocket) => {
      if (outputSocket.valueTypeName !== 'flow') return

      if (outputSocket.links.length === 0) return

      const linkJson = {
        nodeId: outputSocket.links[0].nodeId,
        socket: outputSocket.links[0].socketName
      }

      flowsJson[outputSocket.name] = linkJson
    })

    if (Object.keys(flowsJson).length > 0) {
      nodeJson.flows = flowsJson
    }
    if (graphJson.nodes === undefined) {
      graphJson.nodes = []
    }
    graphJson.nodes.push(nodeJson)
  })

  return graphJson
}
