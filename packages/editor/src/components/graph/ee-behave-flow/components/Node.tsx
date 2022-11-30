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
