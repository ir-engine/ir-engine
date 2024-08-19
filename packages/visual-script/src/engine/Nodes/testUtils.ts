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

import { IGraph, makeGraphApi } from '../Graphs/Graph'
import { NodeConfiguration } from './Node'
import { IFunctionNodeDefinition, IHasTriggered, SocketNames, SocketsDefinition } from './NodeDefinitions'
import { makeOrGenerateSockets } from './nodeFactory'
import { NodeConfigurationDescription } from './Registry/NodeDescription'

const makeEmptyGraph = (): IGraph => {
  return makeGraphApi({
    dependencies: {},
    values: {}
  })
}

export type SocketValues<TSockets extends SocketsDefinition> = {
  [key in SocketNames<TSockets>]?: any
}

/** Helper function to test an function node's exec and get the resulting outputs.
 * Can simulate the input socket values. Returns the output socket values
 */
export const testExec = <
  TInput extends SocketsDefinition,
  TOutput extends SocketsDefinition,
  TConfig extends NodeConfigurationDescription
>({
  nodeInputVals = {},
  configuration = {},
  exec,
  makeGraph = makeEmptyGraph
}: {
  /** Exec function from the node defintion */
  exec: IFunctionNodeDefinition<TInput, TOutput, TConfig>['exec']
  /** Runtime configuration of the node */
  configuration?: NodeConfiguration
  /** Simulated input values the input sockets have */
  nodeInputVals?: SocketValues<TInput>
  makeGraph?: () => IGraph
}): SocketValues<TOutput> => {
  const outputs: SocketValues<TOutput> = {}

  exec({
    read: (socketName) => nodeInputVals[socketName],
    write: (outputValueName, value) => {
      outputs[outputValueName] = value
    },
    configuration,
    graph: makeGraph()
  })

  return outputs
}

export enum RecordedOutputType {
  write = 'write',
  commit = 'commit'
}

export type RecordedWritesOrCommits<TOutput extends SocketsDefinition> = (
  | {
      outputType: RecordedOutputType.write
      socketName: SocketNames<TOutput>
      value: any
    }
  | {
      outputType: RecordedOutputType.commit
      socketName: SocketNames<TOutput>
    }
)[]

/**
 * Generates a function that can be used to test the triggered function of a node.
 * The trigger function will maintain state between each invokation, and returns a list
 * the recorded outputs, including the commits to flow outputs.
 * @returns
 */
export const generateTriggerTester = <TInput extends SocketsDefinition, TOutput extends SocketsDefinition, TState>(
  {
    triggered,
    initialState,
    out
  }: {
    /** Triggered function from the node defintion */
    /** Runtime configuration of the node */
    configuration?: NodeConfiguration
    makeGraph?: () => IGraph
  } & Pick<IHasTriggered<TInput, TOutput, TState>, 'initialState' | 'triggered'> & {
      out: TOutput
    },
  configuration: NodeConfiguration = {},
  makeGraph = makeEmptyGraph
) => {
  let state: TState = initialState

  const graph = makeGraph()

  const outputSocketKeys = getOutputSocketKeys({
    outputs: out,
    config: configuration,
    graph
  })

  /** Triggers the `triggered` function, and updates internal state. Returns a
   * list of the recorded outputs, including the commits to flow outputs.
   */
  const trigger = ({
    inputVals = {},
    triggeringSocketName
  }: {
    /** input values to simulate on the input sockets */
    inputVals?: SocketValues<TInput>
    /** name of the flow socket that is to be triggered */
    triggeringSocketName: SocketNames<TInput>
  }) => {
    const recordedOutputs: RecordedWritesOrCommits<TOutput> = []
    // call the triggered function with the current state and
    // simulated input vals, and udpate the state with the result.
    state = triggered({
      triggeringSocketName,
      read: (socketName) => inputVals[socketName],
      write: (outputValueName, value) => {
        recordedOutputs.push({
          outputType: RecordedOutputType.write,
          socketName: outputValueName,
          value: value
        })
      },
      commit: (outputFlowName, fiberCompletedListener) => {
        recordedOutputs.push({
          outputType: RecordedOutputType.commit,
          socketName: outputFlowName
        })

        if (fiberCompletedListener) {
          fiberCompletedListener()
        }
      },
      configuration,
      graph,
      state: state,
      finished: () => {
        return
      },
      outputSocketKeys
    }) as TState

    return recordedOutputs
  }

  return trigger
}
function getOutputSocketKeys<TSockets extends SocketsDefinition>({
  outputs,
  config,
  graph
}: {
  outputs: TSockets
  config: NodeConfiguration
  graph: IGraph
}): SocketNames<TSockets>[] {
  const sockets = makeOrGenerateSockets(outputs, config, graph)

  return sockets.map((x) => x.name) as SocketNames<TSockets>[]
}
