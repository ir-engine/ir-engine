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
import { useState } from 'react'
import { Node, NodeChange } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { isEqual } from 'lodash'
import { useBehaveGraphFlow } from './useBehaveGraphFlow'

type BehaveGraphFlow = ReturnType<typeof useBehaveGraphFlow>

export const useSelectionHandler = ({
  nodes,
  onNodesChange
}: Pick<BehaveGraphFlow, 'onNodesChange'> & {
  nodes: Node[]
}) => {
  const [selectedNodes, setSelectedNodes] = useState([] as Node[])
  const [copiedNodes, setCopiedNodes] = useState([] as Node[])

  const onSelectionChange = (elements) => {
    if (elements.nodes.length === 0) return
    if (isEqual(elements.nodes.length, selectedNodes)) return
    setSelectedNodes(elements.nodes)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'c' && event.ctrlKey) {
      // Copy selected elements
      setCopiedNodes(selectedNodes)
    }
    if (event.key === 'v' && event.ctrlKey) {
      // Paste copied elements
      const newNodes = copiedNodes.map((node) => ({
        ...node,
        id: uuidv4(), // Generate unique IDs for the new elements
        position: {
          x: node.position.x + node.width! + 10, // Adjust position to avoid overlap
          y: node.position.y
        }
      }))

      const newNodeChange: NodeChange[] = newNodes.map((node) => ({
        type: 'add',
        item: node
      }))

      onNodesChange(newNodeChange)
      setCopiedNodes(newNodes)
    }
  }

  const handleKeyUp = (event) => {
    // empty for now
  }

  return { onSelectionChange, handleKeyDown, handleKeyUp }
}
