// based on Unreal Engine Blueprint DoN node

import { makeFlowNodeDefinition, NodeCategory } from '../../../VisualScriptModule'

export const DoOnce = makeFlowNodeDefinition({
  typeName: 'flow/repeat/None',
  label: 'No Repeat',
  category: NodeCategory.Flow,
  in: {
    flow: 'flow',
    reset: 'flow'
  },
  out: {
    flow: 'flow'
  },
  initialState: {
    firedOnce: false
  },
  triggered: ({ commit, triggeringSocketName, state }) => {
    if (triggeringSocketName === 'reset') {
      return { firedOnce: false }
    }

    if (!state.firedOnce) {
      commit('flow')
      return { firedOnce: true }
    }
    return state
  }
})
