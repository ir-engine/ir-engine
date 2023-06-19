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

import { NodeSpecJSON } from 'behave-graph'
import React from 'react'
import { NodeProps as FlowNodeProps, useEdges } from 'reactflow'

import { useChangeNodeData } from '../hooks/useChangeNodeData'
import styles from '../styles.module.scss'
import { isHandleConnected } from '../util/isHandleConnected'
import InputSocket from './InputSocket'
import NodeContainer from './NodeContainer'
import OutputSocket from './OutputSocket'

type NodeProps = FlowNodeProps & {
  spec: NodeSpecJSON
}

const getPairs = <T, U>(arr1: T[], arr2: U[]) => {
  const max = Math.max(arr1.length, arr2.length)
  const pairs: [T | undefined, U | undefined][] = []
  for (let i = 0; i < max; i++) {
    const pair: [T | undefined, U | undefined] = [arr1[i], arr2[i]]
    pairs.push(pair)
  }
  return pairs
}

export const Node = ({ id, data, spec, selected }: NodeProps) => {
  const edges = useEdges()
  const handleChange = useChangeNodeData(id)
  const pairs = getPairs(spec.inputs, spec.outputs)
  return (
    <NodeContainer title={spec.label} category={spec.category} selected={selected}>
      {pairs.map(([input, output], ix) => (
        <div key={ix} className={styles.node}>
          {input && (
            <InputSocket
              {...input}
              value={data[input.name] ?? input.defaultValue}
              onChange={handleChange}
              connected={isHandleConnected(edges, id, input.name, 'target')}
            />
          )}
          {output && <OutputSocket {...output} connected={isHandleConnected(edges, id, output.name, 'source')} />}
        </div>
      ))}
    </NodeContainer>
  )
}
