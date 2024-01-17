import {
  IGraph,
  NodeCategory,
  SocketsList,
  Variable,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition
} from '@behave-graph/core'

export const EngineVariableSet = makeFlowNodeDefinition({
  typeName: 'engine/variable/set',
  category: NodeCategory.Action,
  label: 'Set',
  configuration: {
    variableName: {
      valueType: 'string',
      defaultValue: 'variable'
    }
  },
  in: (configuration, graph: IGraph) => {
    const variableId = Object.values(graph.variables).find((variable) => variable.name === configuration.variableName)
      ?.id

    const variable = variableId !== undefined ? graph.variables[variableId] : new Variable('-1', 'value', 'string', '')

    const sockets: SocketsList = [
      {
        key: 'flow',
        valueType: 'flow'
      },
      {
        key: Object.keys(configuration).find((key) => key === 'variableName')!,
        valueType: configuration.variableName?.valueType ?? 'string'
      },
      {
        key: 'value',
        valueType: variable.valueTypeName,
        label: variable.name
      }
    ]
    console.log('DEBUG sockets set', sockets)

    return sockets
  },
  initialState: undefined,
  out: { flow: 'flow' },
  triggered: ({ read, commit, graph: { variables }, configuration }) => {
    const variableId = Object.values(variables).find(
      (variable) => variable.name === read(Object.keys(configuration).find((key) => key === 'variableName')!)
    )?.id
    const variable = variables[variableId!]

    if (!variable) return
    console.log('DEBUG triggered set value', read('value'))
    const value = read('value')
    variable.set(value)
    commit('flow')
  }
})

export const EngineVariableGet = makeFunctionNodeDefinition({
  typeName: 'engine/variable/get',
  category: NodeCategory.Query,
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
        key: Object.keys(configuration).find((key) => key === 'variableName')!,
        valueType: configuration.variableName?.valueType ?? 'string'
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
        key: 'value',
        valueType: variable.valueTypeName,
        label: variable.name
      }
    ]

    return result
  },
  exec: ({ read, write, graph: { variables }, configuration }) => {
    const variableId = Object.values(variables).find(
      (variable) => variable.name === read(Object.keys(configuration).find((key) => key === 'variableName')!)
    )?.id
    const variable = variables[variableId!]
    if (!variable) return
    const value = variable.get()
    write('value', value)
  }
})
