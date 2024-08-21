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

import { INode } from '../../Nodes/NodeInstance'
import { GraphNodes } from '../Graph'

export function validateGraphAcyclic(nodes: GraphNodes): string[] {
  // apparently if you can topological sort, it is a DAG according to: https://stackoverflow.com/questions/4168/graph-serialization/4577#4577

  // instead of modifying the graph, I will use metadata to mark it in place.
  Object.values(nodes).forEach((node) => {
    // eslint-disable-next-line no-param-reassign
    node.metadata['dag.marked'] = 'false'
  })

  // it appears that we can just keep trimming nodes whose input sockets have no connections.
  // if we can remove all nodes, that means that there are no cycles.

  const nodesToMark: INode[] = []

  do {
    // clear array: https://stackoverflow.com/a/1232046
    nodesToMark.length = 0

    Object.values(nodes).forEach((node) => {
      // ignore existing marked nodes.
      if (node.metadata['dag.marked'] === 'true') {
        return
      }

      let inputsConnected = false
      node.inputs.forEach((inputSocket) => {
        inputSocket.links.forEach((link) => {
          // is the other end marked?  If not, then it is still connected.
          if (nodes[link.nodeId].metadata['dag.marked'] === 'false') {
            inputsConnected = true
          }
        })
      })
      if (!inputsConnected) {
        nodesToMark.push(node)
      }
    })
    nodesToMark.forEach((node) => {
      // eslint-disable-next-line no-param-reassign
      node.metadata['dag.marked'] = 'true'
    })
  } while (nodesToMark.length > 0)

  const errorList: string[] = []

  // output errors for each unmarked node
  // also remove the metadata related to DAG marking
  Object.values(nodes).forEach((node) => {
    if (node.metadata['dag.marked'] === 'false') {
      errorList.push(`node ${node.description.typeName} is part of a cycle, not a directed acyclic graph`)
    }
    // eslint-disable-next-line no-param-reassign
    delete node.metadata['dag.marked']
  })

  return errorList
}
