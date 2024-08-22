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
import { VisualScriptEngine } from '../Execution/VisualScriptEngine'
import { IGraph } from '../Graphs/Graph'
import { Socket } from '../Sockets/Socket'
import { Node, NodeConfiguration } from './Node'
import { IAsyncNodeDefinition, NodeCategory } from './NodeDefinitions'
import { IAsyncNode, INode, NodeType } from './NodeInstance'
import { NodeDescription } from './Registry/NodeDescription'

// async flow node with only a single flow input
export class AsyncNode extends Node<NodeType.Async> {
  constructor(
    description: NodeDescription,
    graph: IGraph,
    inputs: Socket[] = [],
    outputs: Socket[] = [],
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
      nodeType: NodeType.Async,
      configuration
    })

    // must have at least one input flow socket
    Assert.mustBeTrue(this.inputs.some((socket) => socket.valueTypeName === 'flow'))

    // must have at least one output flow socket
    Assert.mustBeTrue(this.outputs.some((socket) => socket.valueTypeName === 'flow'))
  }

  triggered(engine: VisualScriptEngine, triggeringSocketName: string, finished: () => void) {
    throw new Error('not implemented')
  }

  dispose() {
    throw new Error('not implemented')
  }
}

export class AsyncNode2 extends AsyncNode {
  constructor(props: { description: NodeDescription; graph: IGraph; inputs?: Socket[]; outputs?: Socket[] }) {
    super(props.description, props.graph, props.inputs, props.outputs)
  }
}

export class AsyncNodeInstance<TAsyncNodeDef extends IAsyncNodeDefinition>
  extends Node<NodeType.Async>
  implements IAsyncNode
{
  private triggeredInner: TAsyncNodeDef['triggered']
  private disposeInner: TAsyncNodeDef['dispose']
  private state: TAsyncNodeDef['initialState']

  constructor(node: Omit<INode, 'nodeType'> & Pick<TAsyncNodeDef, 'triggered' | 'initialState' | 'dispose'>) {
    super({ ...node, nodeType: NodeType.Async })

    this.triggeredInner = node.triggered
    this.disposeInner = node.dispose
    this.state = node.initialState
  }

  triggered = (
    engine: Pick<VisualScriptEngine, 'commitToNewFiber'>,
    triggeringSocketName: string,
    finished: () => void
  ) => {
    this.triggeredInner({
      read: this.readInput,
      write: this.writeOutput,
      commit: (outFlowname, fiberCompletedListener) =>
        engine.commitToNewFiber(this, outFlowname, fiberCompletedListener),
      configuration: this.configuration,
      graph: this.graph,
      finished,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      triggeringSocketName
    })
  }
  dispose = () => {
    this.state = this.disposeInner({ state: this.state, graph: this.graph })
  }
}
