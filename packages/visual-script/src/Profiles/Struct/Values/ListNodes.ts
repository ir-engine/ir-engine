import { concat, equals } from 'rambdax'
import {
  Assert,
  NodeCategory,
  SocketsList,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition,
  makeInNOutFunctionDesc,
  sequence
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
  category: NodeCategory.Flow,
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
    const startIndex = Math.max(0, Number(read<bigint>('startIndex')) ?? 0)
    const endIndex = Math.min(list.length, Number(read<bigint>('endIndex')) ?? list.length)
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
