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
import { Fiber } from '../Execution/Fiber'
import { IGraph } from '../Graphs/Graph'
import { Socket } from '../Sockets/Socket'
import { Node, NodeConfiguration } from './Node'
import { IFlowNodeDefinition, NodeCategory } from './NodeDefinitions'
import { IFlowNode, INode, NodeType } from './NodeInstance'
import { NodeDescription } from './Registry/NodeDescription'

export class FlowNode extends Node<NodeType.Flow> implements IFlowNode {
  constructor(
    description: NodeDescription,
    graph: IGraph,
    inputs: Socket[] = [],
    outputs: Socket[] = [],
    configuration: NodeConfiguration = {}
  ) {
    // determine if this is an eval node
    super({
      description: {
        ...description,
        category: description.category as NodeCategory
      },
      inputs,
      outputs,
      graph,
      configuration,
      nodeType: NodeType.Flow
    })

    // must have at least one input flow socket
    Assert.mustBeTrue(this.inputs.some((socket) => socket.valueTypeName === 'flow'))
  }

  triggered(fiber: Fiber, triggeringSocketName: string) {
    throw new Error('not implemented')
  }
}

export class FlowNode2 extends FlowNode {
  constructor(props: {
    description: NodeDescription
    graph: IGraph
    inputs?: Socket[]
    outputs?: Socket[]
    configuration?: NodeConfiguration
  }) {
    super(props.description, props.graph, props.inputs, props.outputs, props.configuration)
  }
}

export class FlowNodeInstance<TFlowNodeDefinition extends IFlowNodeDefinition>
  extends Node<NodeType.Flow>
  implements IFlowNode
{
  private triggeredInner: TFlowNodeDefinition['triggered']
  private state: TFlowNodeDefinition['initialState']
  private readonly outputSocketKeys: string[]

  constructor(nodeProps: Omit<INode, 'nodeType'> & Pick<TFlowNodeDefinition, 'triggered' | 'initialState'>) {
    super({ ...nodeProps, nodeType: NodeType.Flow })
    this.triggeredInner = nodeProps.triggered
    this.state = nodeProps.initialState
    this.outputSocketKeys = nodeProps.outputs.map((s) => s.name)
  }

  public triggered = (fiber: Fiber, triggeringSocketName: string) => {
    this.state = this.triggeredInner({
      commit: (outFlowName, fiberCompletedListener) => fiber.commit(this, outFlowName, fiberCompletedListener),
      read: this.readInput,
      write: this.writeOutput,
      graph: this.graph,
      state: this.state,
      configuration: this.configuration,
      outputSocketKeys: this.outputSocketKeys,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      triggeringSocketName
    })
  }
}
