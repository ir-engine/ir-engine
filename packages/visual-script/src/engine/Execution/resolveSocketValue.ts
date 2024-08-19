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
import { isFunctionNode } from '../Nodes/NodeInstance'
import { Socket } from '../Sockets/Socket'
import { VisualScriptEngine } from './VisualScriptEngine'

export function resolveSocketValue(engine: VisualScriptEngine, inputSocket: Socket): number {
  // if it has no links, leave value on input socket alone.
  if (inputSocket.links.length === 0) {
    return 0
  }

  const nodes = engine.nodes

  const upstreamLink = inputSocket.links[0]
  // caching the target node + socket here increases engine performance by 8% on average.  This is a hotspot.
  if (upstreamLink._targetNode === undefined || upstreamLink._targetSocket === undefined) {
    Assert.mustBeTrue(inputSocket.links.length === 1)

    // if upstream node is an eval, we just return its last value.
    upstreamLink._targetNode = nodes[upstreamLink.nodeId]
    // what is inputSocket connected to?
    upstreamLink._targetSocket = upstreamLink._targetNode.outputs.find(
      (socket) => socket.name === upstreamLink.socketName
    )
    if (upstreamLink._targetSocket === undefined) {
      throw new Error(`can not find socket with the name ${upstreamLink.socketName}`)
    }
  }

  const upstreamNode = upstreamLink._targetNode
  const upstreamOutputSocket = upstreamLink._targetSocket

  // if upstream is a flow/event/async node, do not evaluate it rather just use its existing output socket values
  if (!isFunctionNode(upstreamNode)) {
    inputSocket.value = upstreamOutputSocket.value
    return 0
  }

  let executionSteps = 0

  if (isFunctionNode(upstreamNode)) {
    // resolve all inputs for the upstream node (this is where the recursion happens)
    // TODO: This is a bit dangerous as if there are loops in the graph, this will blow up the stack
    for (const upstreamInputSocket of upstreamNode.inputs) {
      executionSteps += resolveSocketValue(engine, upstreamInputSocket)
    }

    engine.onNodeExecutionStart.emit(upstreamNode)
    upstreamNode.exec(upstreamNode)
    executionSteps++
    engine.onNodeExecutionEnd.emit(upstreamNode)

    // get the output value we wanted.
    inputSocket.value = upstreamOutputSocket.value
    return executionSteps
  }

  return 0
}
