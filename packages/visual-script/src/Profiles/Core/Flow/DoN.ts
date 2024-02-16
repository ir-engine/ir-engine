// based on Unreal Engine Blueprint DoN node

import { makeFlowNodeDefinition, NodeCategory } from '../../../VisualScriptModule'

export const DoN = makeFlowNodeDefinition({
  typeName: 'flow/repeat/n',
  label: 'Repeat N Times',
  category: NodeCategory.Flow,
  in: {
    flow: 'flow',
    n: {
      valueType: 'integer',
      defaultValue: 1
    },
    reset: 'flow'
  },
  out: {
    flow: 'flow',
    count: 'integer'
  },
  initialState: {
    count: 0
  },
  triggered: ({ commit, read, write, triggeringSocketName, state }) => {
    if (triggeringSocketName === 'reset') {
      return { count: 0 }
    }

    if (state.count < Number(read('n'))) {
      write('count', state.count)
      commit('flow')
      return { count: state.count + 1 }
    }
    return state
  }
})
