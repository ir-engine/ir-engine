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

// could move this to the core package instaead of keeping it in the engine package

import { useEffect } from 'react'

import { defineSystem, destroySystem, InputSystemGroup, SystemUUID } from '@etherealengine/ecs'
import {
  IGraph,
  makeEventNodeDefinition,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition,
  NodeCategory,
  SocketsList,
  Variable
} from '@etherealengine/visual-script'

export const EngineVariableGet = makeFunctionNodeDefinition({
  typeName: 'engine/variable/get',
  category: NodeCategory.Variable,
  label: 'Get',
  configuration: {
    variableName: {
      valueType: 'string',
      defaultValue: 'variable'
    }
  },
  in: (configuration, graph) => {
    const sockets: SocketsList = [
      {
        key: Object.keys(EngineVariableGet.configuration!).find((key) => key === 'variableName')!,
        valueType: EngineVariableGet.configuration!.variableName?.valueType,
        choices: Object.values(graph.variables).map((variable: Variable) => variable.name)
      }
    ]
    return sockets
  },
  out: (configuration, graph) => {
    const variableId = Object.values(graph.variables).find(
      (variable: Variable) => variable.name === configuration.variableName
    )?.id

    const variable = variableId !== undefined ? graph.variables[variableId] : new Variable('-1', 'value', 'string', '')

    const result: SocketsList = [
      {
        key: 'value',
        valueType: variable.valueTypeName,
        label: variable.name
      }
    ]

    return result
  },
  exec: ({ read, write, graph: { variables }, configuration }) => {
    const variableId = Object.values(variables).find(
      (variable: Variable) => variable.name === read<string>('variableName')
    )?.id
    const variable = variables[variableId!]
    if (!variable) return
    const value = variable.get()
    write('value', value)
  }
})

export const EngineVariableSet = makeFlowNodeDefinition({
  typeName: 'engine/variable/set',
  category: NodeCategory.Variable,
  label: 'Set',
  configuration: {
    variableName: {
      valueType: 'string',
      defaultValue: 'variable'
    }
  },
  in: (configuration, graph: IGraph) => {
    const variableId = Object.values(graph.variables).find(
      (variable: Variable) => variable.name === configuration.variableName
    )?.id

    const variable = variableId !== undefined ? graph.variables[variableId] : new Variable('-1', 'value', 'string', '')

    const sockets: SocketsList = [
      {
        key: 'flow',
        valueType: 'flow'
      },
      {
        key: Object.keys(EngineVariableSet.configuration!).find((key) => key === 'variableName')!,
        valueType: EngineVariableSet.configuration!.variableName?.valueType,
        choices: Object.values(graph.variables).map((variable: Variable) => variable.name)
      },
      {
        key: 'value',
        valueType: variable.valueTypeName,
        label: variable.name
      }
    ]

    return sockets
  },
  initialState: undefined,
  out: { flow: 'flow' },
  triggered: ({ read, commit, graph: { variables }, configuration }) => {
    const variableId = Object.values(variables).find(
      (variable: Variable) => variable.name === read(Object.keys(configuration).find((key) => key === 'variableName')!)
    )?.id
    const variable = variables[variableId!]

    if (!variable) return

    variable.set(read('value'))

    commit('flow')
  }
})

type State = {
  systemUUID: SystemUUID
}

const initialState = (): State => ({
  systemUUID: '' as SystemUUID
})
let useVariableSystemCounter = 0
const useVariableSystemUUID = 'visual-script-useVariable-'

export const getUseVariableSystemUUID = (variableName) =>
  (useVariableSystemUUID + `${variableName}-` + useVariableSystemCounter) as SystemUUID

export const EngineVariableUse = makeEventNodeDefinition({
  typeName: 'engine/variable/use',
  category: NodeCategory.Variable,
  label: 'Use',
  configuration: {
    variableName: {
      valueType: 'string',
      defaultValue: 'variable'
    }
  },
  in: (configuration, graph) => {
    const sockets: SocketsList = [
      {
        key: Object.keys(EngineVariableGet.configuration!).find((key) => key === 'variableName')!,
        valueType: EngineVariableGet.configuration!.variableName?.valueType,
        choices: Object.values(graph.variables).map((variable: Variable) => variable.name)
      }
    ]
    return sockets
  },
  out: (configuration, graph) => {
    const variableId = Object.values(graph.variables).find((variable) => variable.name === configuration.variableName)
      ?.id

    const variable = variableId !== undefined ? graph.variables[variableId] : new Variable('-1', 'value', 'string', '')

    const result: SocketsList = [
      {
        key: 'valueChange',
        valueType: 'flow'
      },
      {
        key: 'value',
        valueType: variable.valueTypeName,
        label: variable.name
      }
    ]

    return result
  },
  initialState: initialState(),
  init: ({ read, commit, write, graph: { variables } }) => {
    const variableId = Object.values(variables).find((variable) => variable.name === read<string>('variableName'))?.id
    if (variableId === undefined) return initialState()
    const variableValueQueue: any[] = [variables[variableId].get()]
    const changeVariable = (variable) => {
      variableValueQueue.unshift(variable.get())
    }
    useVariableSystemCounter++
    const systemUUID = defineSystem({
      uuid: getUseVariableSystemUUID(read<string>('variableName')),
      insert: { with: InputSystemGroup },
      execute: () => {
        const value = variableValueQueue.pop()
        if (value === undefined) return
        write('value', value)
        commit('valueChange')
      },
      reactor: () => {
        useEffect(() => {
          variables[variableId].onChanged.addListener(changeVariable)
          return () => {
            variables[variableId].onChanged.removeListener(changeVariable)
          }
        }, [])
        return null
      }
    })

    const state: State = {
      systemUUID
    }
    return state
  },
  dispose: ({ state: { systemUUID } }) => {
    destroySystem(systemUUID)
    return initialState()
  }
})
