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

import { concat, equals } from 'rambdax'

import {
  Assert,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition,
  makeInNOutFunctionDesc,
  NodeCategory,
  sequence,
  SocketsList
} from '../../../VisualScriptModule'

export const Constant = makeInNOutFunctionDesc({
  name: 'logic/list/constant',
  category: NodeCategory.Logic,
  label: 'List',
  in: ['list'],
  out: 'list',
  exec: (a: unknown[]) => a
})

export const Equal = makeInNOutFunctionDesc({
  name: 'logic/list/compare/equal',
  category: NodeCategory.Logic,
  label: '=',
  in: ['list', 'list'],
  out: 'boolean',
  exec: (a: object, b: object) => equals(a, b)
})

export const Concat = makeFunctionNodeDefinition({
  typeName: 'logic/list/concat',
  category: NodeCategory.Logic,
  configuration: {
    numInputs: {
      valueType: 'number',
      defaultValue: 2
    }
  },
  label: 'Concat',
  in: (_) => {
    const sockets: SocketsList = []

    const list = (index: number) => {
      return {
        key: `list${index}`,
        valueType: 'list'
      }
    }

    for (const index of sequence(1, (_.numInputs ?? Concat.configuration?.numInputs.defaultValue) + 1)) {
      sockets.push({ ...list(index) })
    }
    return sockets
  },
  out: {
    result: 'list'
  },
  exec: ({ read, write, configuration }) => {
    let listToConcat: unknown[] = []
    for (const index of sequence(1, (configuration.numInputs ?? Concat.configuration?.numInputs.defaultValue) + 1)) {
      const list = read<unknown[]>(`componentName${index}`)

      listToConcat = concat(listToConcat, list)
    }
    write('result', listToConcat)
  }
})

export const ListLoop = makeFlowNodeDefinition({
  typeName: 'logic/list/loop',
  category: NodeCategory.Logic,
  label: 'list Loop',
  in: {
    flow: 'flow',
    list: 'list',
    startIndex: 'integer',
    endIndex: 'integer'
  },
  out: {
    loopBody: 'flow',
    index: 'integer',
    value: 'string', // convert as needed
    completed: 'flow'
  },
  initialState: undefined,
  triggered: ({ read, write, commit }) => {
    const list = read<any[]>('list')
    const startIndex = Math.max(0, Number(read<bigint>('startIndex')) || 0)
    const endIndex = Math.min(list.length, Number(read<bigint>('endIndex')) || list.length)
    const loopBodyIteration = (i: number) => {
      if (i < endIndex) {
        write('value', JSON.stringify(list[i]))
        write('index', i)
        commit('loopBody', () => {
          loopBodyIteration(i + 1)
        })
      } else {
        commit('completed')
      }
    }
    loopBodyIteration(startIndex)
  }
})

export const getIndex = makeFunctionNodeDefinition({
  typeName: 'logic/list/getIndex',
  category: NodeCategory.Logic,
  label: 'get Index',
  in: {
    list: 'list',
    index: 'integer'
  },
  out: {
    index: 'integer',
    value: 'string'
  },
  exec: ({ read, write }) => {
    const list = read<any[]>('list')
    const index = read<number>('index')
    Assert.mustBeTrue(index >= 0 && index < list.length, 'ERROR: index out of range')
    write('index', index)
    write('value', JSON.stringify(list[index]))
  }
})

export const getLength = makeFunctionNodeDefinition({
  typeName: 'logic/list/getLength',
  category: NodeCategory.Logic,
  label: 'get Length',
  in: {
    list: 'list'
  },
  out: {
    length: 'integer'
  },
  exec: ({ read, write }) => {
    const list = read<any[]>('list')
    write('length', list.length)
  }
})
