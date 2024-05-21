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

import { Assert } from '../Diagnostics/Assert'
import { GraphNodes } from '../Graphs/Graph'
import { Link } from '../Nodes/Link'
import { INode, isAsyncNode, isFlowNode } from '../Nodes/NodeInstance'
import { resolveSocketValue } from './resolveSocketValue'
import { VisualScriptEngine } from './VisualScriptEngine'

export class Fiber {
  private readonly fiberCompletedListenerStack: (() => void)[] = []
  private readonly nodes: GraphNodes
  public executionSteps = 0

  constructor(
    public engine: VisualScriptEngine,
    public nextEval: Link | null,
    fiberCompletedListener: (() => void) | undefined = undefined
  ) {
    this.nodes = engine.nodes
    if (fiberCompletedListener !== undefined) {
      this.fiberCompletedListenerStack.push(fiberCompletedListener)
    }
  }

  // this is syncCommit.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  commit(node: INode, outputSocketName: string, fiberCompletedListener: (() => void) | undefined = undefined) {
    Assert.mustBeTrue(isFlowNode(node))
    Assert.mustBeTrue(this.nextEval === null)

    const outputSocket = node.outputs.find((socket) => socket.name === outputSocketName)
    if (outputSocket === undefined) {
      throw new Error(`can not find socket with the name ${outputSocketName}`)
    }

    if (outputSocket.links.length > 1) {
      throw new Error(
        'invalid for an output flow socket to have multiple downstream links:' +
          `${node.description.typeName}.${outputSocket.name} has ${outputSocket.links.length} downlinks`
      )
    }
    if (outputSocket.links.length === 1) {
      const link = outputSocket.links[0]
      if (link === undefined) {
        throw new Error('link must be defined')
      }
      this.nextEval = link
    }

    if (fiberCompletedListener !== undefined) {
      this.fiberCompletedListenerStack.push(fiberCompletedListener)
    }
  }

  // returns the number of new execution steps created as a result of this one step
  executeStep() {
    // pop the next node off the queue
    const link = this.nextEval
    this.nextEval = null

    // nothing waiting, thus go back and start to evaluate any callbacks, in stack order.
    if (link === null) {
      if (this.fiberCompletedListenerStack.length === 0) {
        return
      }
      const awaitingCallback = this.fiberCompletedListenerStack.pop()
      if (awaitingCallback === undefined) {
        throw new Error('awaitingCallback is empty')
      }
      awaitingCallback()
      return
    }

    const node = this.nodes[link.nodeId]

    node.inputs.forEach((inputSocket) => {
      if (inputSocket.valueTypeName !== 'flow') {
        this.executionSteps += resolveSocketValue(this.engine, inputSocket)
      }
    })

    // first resolve all input values
    // flow socket is set to true for the one flowing in, while all others are set to false.
    this.engine.onNodeExecutionStart.emit(node)
    if (isAsyncNode(node)) {
      this.engine.asyncNodes.push(node)
      node.triggered(this.engine, link.socketName, () => {
        // remove from the list of pending async nodes
        const index = this.engine.asyncNodes.indexOf(node)
        this.engine.asyncNodes.splice(index, 1)
        this.engine.onNodeExecutionEnd.emit(node)
        this.executionSteps++
      })
      return
    }
    if (isFlowNode(node)) {
      node.triggered(this, link.socketName)
      this.engine.onNodeExecutionEnd.emit(node)
      this.executionSteps++
      return
    }

    throw new TypeError(`should not get here, unhandled node ${node.description.typeName}`)
  }

  isCompleted() {
    return this.fiberCompletedListenerStack.length === 0 && this.nextEval === null
  }
}
