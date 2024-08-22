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

import { Assert } from '../Diagnostics/Assert'
import { IGraph } from '../Graphs/Graph'
import { Socket } from '../Sockets/Socket'
import { Node, NodeConfiguration } from './Node'
import {
  IFunctionNodeDefinition,
  NodeCategory,
  SocketListDefinition,
  SocketsList,
  makeFunctionNodeDefinition
} from './NodeDefinitions'
import { IFunctionNode, INode, NodeType } from './NodeInstance'
import { readInputFromSockets, writeOutputsToSocket } from './NodeSockets'
import { NodeDescription } from './Registry/NodeDescription'

export abstract class FunctionNode extends Node<NodeType.Function> implements IFunctionNode {
  constructor(
    description: NodeDescription,
    graph: IGraph,
    inputs: Socket[] = [],
    outputs: Socket[] = [],
    public readonly exec: (node: INode) => void,
    configuration: NodeConfiguration = {}
  ) {
    super({
      description: {
        ...description,
        category: description.category as NodeCategory
      },
      inputs,
      outputs,
      graph,
      configuration,
      nodeType: NodeType.Function
    })

    // must have no input flow sockets
    Assert.mustBeTrue(!this.inputs.some((socket) => socket.valueTypeName === 'flow'))

    // must have no output flow sockets
    Assert.mustBeTrue(!this.outputs.some((socket) => socket.valueTypeName === 'flow'))
  }
}

export class FunctionNodeInstance<TFunctionNodeDef extends IFunctionNodeDefinition>
  extends Node<NodeType.Function>
  implements IFunctionNode
{
  private execInner: TFunctionNodeDef['exec']
  constructor(nodeProps: Omit<INode, 'nodeType'> & Pick<TFunctionNodeDef, 'exec'>) {
    super({ ...nodeProps, nodeType: NodeType.Function })

    this.execInner = nodeProps.exec
  }

  exec = (node: INode) => {
    this.execInner({
      read: (name) => readInputFromSockets(node.inputs, name, node.description.typeName),
      write: (name, value) => writeOutputsToSocket(node.outputs, name, value, node.description.typeName),
      configuration: this.configuration,
      graph: this.graph
    })
  }
}

const alpha = 'abcdefghijklmnop'
const getAlphabeticalKey = (index: number) => alpha[index]

/** Converts list of sockets specifying value type names to an ordeered list of sockets,
 */

function makeSocketsList(
  sockets: (string | { [key: string]: string })[] | undefined,
  getKey: (index: number) => string
): SocketsList {
  if (!sockets || sockets.length === 0) return []

  return sockets.map((x, i): SocketListDefinition => {
    if (typeof x === 'string') {
      return {
        key: getKey(i),
        valueType: x
      }
    }
    return {
      key: Object.keys(x)[0],
      valueType: x[Object.keys(x)[0]]
    }
  })
}

export function makeInNOutFunctionDesc({
  in: inputs,
  out,
  exec,
  category,
  ...rest
}: {
  name: string
  label: string
  aliases?: string[]
  in?: (string | { [key: string]: string })[]
  out: (string | { [key: string]: string })[] | string
  category?: NodeCategory
  exec: (...args: any[]) => any
}) {
  const inputSockets = makeSocketsList(inputs, getAlphabeticalKey)
  const outputKeyFunc = typeof out === 'string' || out.length > 1 ? () => 'result' : getAlphabeticalKey
  const outList = typeof out === 'string' ? [out] : out
  const outputSockets = makeSocketsList(outList, outputKeyFunc)

  const definition = makeFunctionNodeDefinition({
    typeName: rest.name,
    label: rest.label,
    in: () => inputSockets,
    out: () => outputSockets,
    category,
    exec: ({ read, write }) => {
      const args = inputSockets.map(({ key }) => read(key))
      const results = exec(...args)
      if (outputSockets.length === 1 && outputSockets[0].key === 'result') {
        write('result', results)
      } else {
        outputSockets.forEach(({ key }) => {
          write(key, results[key])
        })
      }
    }
  })

  return definition
}
