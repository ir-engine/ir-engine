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

/* eslint-disable space-in-parens */
// fdfdfd
import { Assert } from '../Diagnostics/Assert'
import { EventEmitter } from '../Events/EventEmitter'
import { GraphNodes } from '../Graphs/Graph'
import { IAsyncNode, IEventNode, INode, isAsyncNode, isEventNode } from '../Nodes/NodeInstance'
import { sleep } from '../sleep'
import { Fiber } from './Fiber'
import { resolveSocketValue } from './resolveSocketValue'

export class VisualScriptEngine {
  // tracking the next node+input socket to execute.
  private readonly fiberQueue: Fiber[] = []
  public readonly asyncNodes: IAsyncNode[] = []
  public readonly eventNodes: IEventNode[] = []
  public readonly onNodeExecutionStart = new EventEmitter<INode>()
  public readonly onNodeExecutionEnd = new EventEmitter<INode>()
  public executionSteps = 0

  constructor(public readonly nodes: GraphNodes) {
    // collect all event nodes
    Object.values(nodes).forEach((node) => {
      if (isEventNode(node)) {
        this.eventNodes.push(node)
      }
    })
    // init all event nodes at startup
    this.eventNodes.forEach((eventNode) => {
      // evaluate input parameters
      eventNode.inputs.forEach((inputSocket) => {
        Assert.mustBeTrue(inputSocket.valueTypeName !== 'flow')
        this.executionSteps += resolveSocketValue(this, inputSocket)
      })

      this.onNodeExecutionStart.emit(eventNode)
      eventNode.init(this)
      this.executionSteps++
      this.onNodeExecutionEnd.emit(eventNode)
    })
  }

  dispose() {
    // dispose all, possibly in-progress, async nodes
    this.asyncNodes.forEach((asyncNode) => asyncNode.dispose())

    // dispose all event nodes
    this.eventNodes.forEach((eventNode) => eventNode.dispose(this))
  }

  // asyncCommit
  commitToNewFiber(
    node: INode,
    outputFlowSocketName: string,
    fiberCompletedListener: (() => void) | undefined = undefined
  ) {
    Assert.mustBeTrue(isEventNode(node) || isAsyncNode(node))
    const outputSocket = node.outputs.find((socket) => socket.name === outputFlowSocketName)
    if (outputSocket === undefined) {
      throw new Error(`no socket with the name ${outputFlowSocketName}`)
    }
    if (outputSocket.links.length > 1) {
      throw new Error(
        'invalid for an output flow socket to have multiple downstream links:' +
          `${node.description.typeName}.${outputSocket.name} has ${outputSocket.links.length} downlinks`
      )
    }
    if (outputSocket.links.length === 1) {
      const fiber = new Fiber(this, outputSocket.links[0], fiberCompletedListener)
      this.fiberQueue.push(fiber)
    }
  }

  // NOTE: This does not execute all if there are promises.
  executeAllSync(limitInSeconds = 100, limitInSteps = 100000000): number {
    const startDateTime = Date.now()
    let elapsedSeconds = 0
    let elapsedSteps = 0
    while (elapsedSteps < limitInSteps && elapsedSeconds < limitInSeconds && this.fiberQueue.length > 0) {
      const currentFiber = this.fiberQueue[0]
      const startingFiberExecutionSteps = currentFiber.executionSteps
      currentFiber.executeStep()
      elapsedSteps += currentFiber.executionSteps - startingFiberExecutionSteps
      if (currentFiber.isCompleted()) {
        // remove first element
        this.fiberQueue.shift()
      }
      elapsedSeconds = (Date.now() - startDateTime) * 0.001
    }
    this.executionSteps += elapsedSteps

    return elapsedSteps
  }

  async executeAllAsync(limitInSeconds = 100, limitInSteps = 100000000): Promise<number> {
    const startDateTime = Date.now()
    let elapsedSteps = 0
    let elapsedTime = 0
    let iterations = 0
    do {
      if (iterations > 0) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(0)
      }
      elapsedSteps += this.executeAllSync(limitInSeconds - elapsedTime, limitInSteps - elapsedSteps)
      elapsedTime = (Date.now() - startDateTime) * 0.001
      iterations += 1
    } while (
      (this.asyncNodes.length > 0 || this.fiberQueue.length > 0) &&
      elapsedTime < limitInSeconds &&
      elapsedSteps < limitInSteps
    )

    return elapsedSteps
  }
}
