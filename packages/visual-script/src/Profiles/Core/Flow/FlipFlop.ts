import { makeFlowNodeDefinition, NodeCategory } from '../../../VisualScriptModule'

export const FlipFlop = makeFlowNodeDefinition({
  typeName: 'flow/decision/flipFlop',
  category: NodeCategory.Flow,
  label: 'Flip Flop',
  in: {
    flow: 'flow'
  },
  out: {
    on: 'flow',
    off: 'flow',
    isOn: 'boolean'
  },
  initialState: {
    isOn: true
  },
  triggered: ({ commit, write, state }) => {
    write('isOn', state.isOn)
    commit(state.isOn ? 'on' : 'off')
    return { isOn: !state.isOn }
  }
})
