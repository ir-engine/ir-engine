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

import { NodeSpecJSON } from '@behave-graph/core'
import React from 'react'
import { NodeProps as FlowNodeProps, useEdges } from 'reactflow'

import { faCircleMinus, faCirclePlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useModifyNodeSocket } from '../hooks/useChangeNodeConfiguration'
import { useChangeNodeData } from '../hooks/useChangeNodeValues'
import { NodeSpecGenerator } from '../hooks/useNodeSpecGenerator'
import { isHandleConnected } from '../util/isHandleConnected'
import InputSocket from './InputSocket'
import NodeContainer from './NodeContainer'
import OutputSocket from './OutputSocket'

type NodeProps = FlowNodeProps & {
  spec: NodeSpecJSON
  specGenerator: NodeSpecGenerator
}

const getPairs = <T, U>(arr1: T[], arr2: U[]) => {
  const max = Math.max(arr1.length, arr2.length)
  const pairs: any[] = []
  for (let i = 0; i < max; i++) {
    const pair: [T | undefined, U | undefined] = [arr1[i], arr2[i]]
    pairs.push(pair)
  }
  return pairs
}

export const Node: React.FC<NodeProps> = ({ id, data, spec, selected, specGenerator }: NodeProps) => {
  const edges = useEdges()
  const handleChange = useChangeNodeData(id)
  const pairs = getPairs(spec.inputs, spec.outputs)
  const canAddInputs = spec.configuration.find((config) => config.name === 'numInputs' && config.valueType === 'number')
  const canAddOutputs = spec.configuration.find(
    (config) => config.name === 'numOutputs' && config.valueType === 'number'
  )
  const canAddBoth = spec.configuration.find((config) => config.name === 'numCases' && config.valueType === 'number')
  let handleAddNodeSocket
  let handleDecreaseNodeSocket
  if (canAddInputs) {
    handleAddNodeSocket = useModifyNodeSocket(id, 'inputs', 'increase', (canAddInputs.defaultValue as number) ?? 1)
    handleDecreaseNodeSocket = useModifyNodeSocket(id, 'inputs', 'decrease', (canAddInputs.defaultValue as number) ?? 1)
  } else if (canAddOutputs) {
    handleAddNodeSocket = useModifyNodeSocket(id, 'outputs', 'increase', (canAddOutputs.defaultValue as number) ?? 1)
    handleDecreaseNodeSocket = useModifyNodeSocket(
      id,
      'outputs',
      'decrease',
      (canAddOutputs.defaultValue as number) ?? 1
    )
  } else if (canAddBoth) {
    handleAddNodeSocket = useModifyNodeSocket(id, 'both', 'increase', (canAddBoth.defaultValue as number) ?? 1)
    handleDecreaseNodeSocket = useModifyNodeSocket(id, 'both', 'decrease', (canAddBoth.defaultValue as number) ?? 1)
  }
  const containerRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '2px',
    padding: '0 8px'
  }

  return (
    <NodeContainer title={spec.label} category={spec.category} selected={selected}>
      {pairs.map(([input, output], ix) => (
        <div key={ix} className="node-container-row" style={containerRowStyle}>
          {input && (
            <InputSocket
              {...input}
              specGenerator={specGenerator}
              value={data.values?.[input.name] ?? input.defaultValue}
              onChange={handleChange}
              connected={isHandleConnected(edges, id, input.name, 'target')}
            />
          )}
          {output && (
            <OutputSocket
              {...output}
              specGenerator={specGenerator}
              connected={isHandleConnected(edges, id, output.name, 'source')}
            />
          )}
        </div>
      ))}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignSelf: 'center',
          padding: '2px'
        }}
      >
        {handleAddNodeSocket && (
          <button
            style={{
              backgroundColor: 'transparent',
              cursor: 'pointer', // Add this to make the button cursor change to a pointer on hover
              color: 'white'
            }}
            onClick={handleAddNodeSocket}
          >
            <FontAwesomeIcon icon={faCirclePlus} color="#ffffff" />
            {' Add socket'}
          </button>
        )}

        {handleDecreaseNodeSocket && (
          <button
            style={{
              backgroundColor: 'transparent',
              cursor: 'pointer', // Add this to make the button cursor change to a pointer on hover
              color: 'white'
            }}
            onClick={handleDecreaseNodeSocket}
          >
            <FontAwesomeIcon icon={faCircleMinus} color="#ffffff" />
            {'Remove socket'}
          </button>
        )}
      </div>
    </NodeContainer>
  )
}
