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

import React from 'react'
import { FaCircleMinus, FaCirclePlus } from 'react-icons/fa6'
import { NodeProps as FlowNodeProps, useEdges } from 'reactflow'

import {
  NodeSpecGenerator,
  isHandleConnected,
  useChangeNode
} from '@etherealengine/editor/src/components/visualScript/VisualScriptUIModule'
import { useModifyNodeSocket } from '@etherealengine/editor/src/components/visualScript/hooks/useModifyNodeSocket'
import { NodeSpecJSON } from '@etherealengine/visual-script'
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import { categoryColorMap, colors } from '../util/colors'
import InputSocket from './socket/input'
import OutputSocket from './socket/output'

type NodeUIProps = FlowNodeProps & {
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

const nodeContentClassName = 'flex gap-4 p-1.5 border-grey-800'

export const Node: React.FC<NodeUIProps> = ({ id, data, spec, selected, specGenerator }: NodeUIProps) => {
  const [collapsed, setCollapsed] = React.useState(false)
  const edges = useEdges()
  const isVariableNode = spec.configuration.find(
    (config) => config.name === 'variableName' && config.valueType === 'string'
  )
  const handleChange = useChangeNode(id, isVariableNode !== undefined)
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

  const pairs = getPairs(spec.inputs, spec.outputs)
  const label = spec.label === '' ? data.label : spec.label

  let colorName = categoryColorMap[spec.category]
  if (colorName === undefined) {
    colorName = 'red'
  }
  const [backgroundColor, borderColor, textColor] = colors[colorName]

  return (
    <div
      className={twMerge(
        'min-w-[120px] cursor-pointer rounded bg-zinc-900 text-sm text-neutral-400',
        selected ? 'border-2 border-gray-600' : ''
      )}
    >
      <div
        className={twMerge(
          'flex-between flex items-center gap-3 bg-zinc-900 px-2 py-1 align-middle text-white',
          collapsed ? 'rounded' : 'rounded-tl rounded-tr',
          backgroundColor,
          textColor
        )}
      >
        {collapsed && pairs[0][0] && (
          <InputSocket
            {...pairs[0][0]}
            name=""
            specGenerator={specGenerator}
            onChange={handleChange}
            connected={isHandleConnected(edges, id, pairs[0][0].name, 'target')}
            collapsed={collapsed}
          />
        )}
        {collapsed ? (
          <MdKeyboardArrowRight onClick={() => setCollapsed(false)} />
        ) : (
          <MdKeyboardArrowDown onClick={() => setCollapsed(true)} />
        )}
        {label}
        {collapsed && pairs[0][1] && (
          <OutputSocket
            {...pairs[0][1]}
            name=""
            specGenerator={specGenerator}
            connected={isHandleConnected(edges, id, pairs[0][1].name, 'source')}
            collapsed={collapsed}
          />
        )}
      </div>
      {!collapsed && (
        <div className={twMerge('flex-col', nodeContentClassName, borderColor)}>
          {pairs.map(([input, output], ix) => (
            <div key={ix} className="node-container-row flex flex-row justify-between gap-0.5 p-0">
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
          <div className="flex flex-col self-center p-0.5">
            {handleAddNodeSocket && (
              <button
                style={{
                  backgroundColor: 'transparent',
                  cursor: 'pointer', // Add this to make the button cursor change to a pointer on hover
                  color: 'white'
                }}
                onClick={handleAddNodeSocket}
              >
                <FaCirclePlus color="#ffffff" />
                {' Add socket'}
              </button>
            )}

            {handleDecreaseNodeSocket && (
              <button className="cursor-pointer bg-transparent text-white" onClick={handleDecreaseNodeSocket}>
                <FaCircleMinus color="#ffffff" />
                {'Remove socket'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
