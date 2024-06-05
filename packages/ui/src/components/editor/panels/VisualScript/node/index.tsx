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

const calculatePosition = (index, total) => {
  if (total === 1) return { x: 0 }
  let x = 0
  const y = (index / total) * 100
  if (total < 2) {
    return { x: x, y: (index + 1 / total) * 100 }
  }
  if (total < 7) {
    x =
      (total % 2
        ? index > total / 2
          ? index - Math.floor(total / 2)
          : Math.floor(total / 2) - index
        : index > (total - 1) / 2
        ? index + 1 - total / 2
        : total / 2 - index) *
      2 *
      Math.PI
    return { x: x, y: y }
  }
  // whem we have more than 7 inputs or outputs the rest of the handle fall on a flat plane so we only need to calculate for the top and bottom 3 handles
  if (index <= 3) x = Math.max((3 - index) * 6, 1)
  if (index === 0) x = 24
  if (total - 1 - index <= 3) x = Math.max((3 - (total - 1 - index)) * 2 * Math.PI, 1)
  if (index === total - 1) x = 24
  return { x: x, y: y }
}

const calculateRelativePosition = (index, type, outputTotal, inputTotal) => {
  return type === 'output'
    ? outputTotal > inputTotal
      ? index
      : Math.floor(((index + 1) * inputTotal) / (outputTotal + 1))
    : inputTotal > outputTotal
    ? index
    : Math.floor(((index + 1) * outputTotal) / (inputTotal + 1))
}

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
  const collapsedHandlePositions = [] as any[]
  for (let i = 0; i < pairs.length; i++) {
    collapsedHandlePositions.push(calculatePosition(i, pairs.length))
  }

  const collapsedStyle = collapsed
    ? { height: `${1.25 * pairs.length}rem`, borderRadius: `${0.625 * pairs.length}rem` }
    : {}
  return (
    <div
      className={twMerge(
        'min-w-[120px] cursor-pointer bg-zinc-900 text-sm text-neutral-400',
        selected ? 'border-2 border-gray-600 ' : ''
      )}
      style={collapsedStyle as any}
    >
      <div
        className={twMerge(
          'flex-between flex items-center gap-3 bg-zinc-900 px-2 py-1 align-middle text-white',
          collapsed ? `` : 'rounded-tl rounded-tr',
          backgroundColor,
          textColor
        )}
        style={collapsedStyle as any}
      >
        {collapsed &&
          pairs.map(
            ([input, output], ix) =>
              input && (
                <InputSocket
                  {...input}
                  specGenerator={specGenerator}
                  value={data.values?.[input.name] ?? input.defaultValue}
                  onChange={handleChange}
                  connected={isHandleConnected(edges, id, input.name, 'target')}
                  collapsed={collapsed}
                  offset={
                    collapsedHandlePositions[
                      calculateRelativePosition(ix, 'input', spec.outputs.length, spec.inputs.length)
                    ]
                  }
                />
              )
          )}
        {collapsed ? (
          <MdKeyboardArrowRight onClick={() => setCollapsed(false)} />
        ) : (
          <MdKeyboardArrowDown onClick={() => setCollapsed(true)} />
        )}
        {label}

        {collapsed &&
          pairs.map(
            ([input, output], ix) =>
              output && (
                <OutputSocket
                  {...output}
                  specGenerator={specGenerator}
                  connected={isHandleConnected(edges, id, output.name, 'source')}
                  collapsed={collapsed}
                  offset={
                    collapsedHandlePositions[
                      calculateRelativePosition(ix, 'output', spec.outputs.length, spec.inputs.length)
                    ]
                  }
                />
              )
          )}
      </div>
      {!collapsed && (
        <div className={twMerge('flex-col', 'border-grey-800 flex gap-4 p-1.5', borderColor)}>
          {pairs.map(([input, output], ix) => (
            <div key={ix} className="node-container-row flex flex-row justify-between gap-0.5 p-0">
              {input && (
                <InputSocket
                  {...input}
                  specGenerator={specGenerator}
                  value={data.values?.[input.name] ?? input.defaultValue}
                  onChange={handleChange}
                  connected={isHandleConnected(edges, id, input.name, 'target')}
                  collapsed={collapsed}
                />
              )}
              {output && (
                <OutputSocket
                  {...output}
                  specGenerator={specGenerator}
                  connected={isHandleConnected(edges, id, output.name, 'source')}
                  collapsed={collapsed}
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
