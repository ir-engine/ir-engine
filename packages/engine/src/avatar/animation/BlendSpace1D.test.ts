import assert from 'assert'

import { addBlendSpace1DNode, updateBlendSpace1D } from './BlendSpace1D'

describe('addBlendSpace1DNode', () => {
  it('Will test node addition', () => {
    const bs1d = {
      minValue: 0,
      maxValue: 1,
      nodes: [] as any
    }
    const position = 1
    const action = {}
    const data = {}

    addBlendSpace1DNode(bs1d, action as any, position, data)

    assert(bs1d.nodes.length === 1)
    assert(bs1d.nodes[0].action === action)
    assert(bs1d.nodes[0].weight === 0)
    assert(bs1d.nodes[0].position === position)
    assert(bs1d.nodes[0].data === data)
  })

  it('Will sort nodes', () => {
    const bs1d = {
      minValue: 0,
      maxValue: 1,
      nodes: [] as any
    }
    const position1 = 1
    const action1 = {}
    const position2 = 0
    const action2 = {}

    addBlendSpace1DNode(bs1d, action1 as any, position1)
    addBlendSpace1DNode(bs1d, action2 as any, position2)

    assert(bs1d.nodes.length === 2)
    assert(bs1d.nodes[0].position === position2)
    assert(bs1d.nodes[1].position === position1)
  })
})

describe('updateBlendSpace1D', () => {
  it('Will test correct actions are selected', () => {
    const bs1d = {
      minValue: -100,
      maxValue: 100,
      nodes: [] as any
    }

    const action1 = {
      weight: 1
    }
    const action2 = Object.assign({}, action1)
    const action3 = Object.assign({}, action1)

    addBlendSpace1DNode(bs1d, action2 as any, 0)
    addBlendSpace1DNode(bs1d, action3 as any, 100)
    addBlendSpace1DNode(bs1d, action1 as any, -100)

    const returnedNodes = updateBlendSpace1D(bs1d, 50)

    assert(returnedNodes.length === 2)
    assert(returnedNodes[0] === bs1d.nodes[1])
    assert(returnedNodes[1] === bs1d.nodes[2])
    assert(action1.weight === 0)
    assert(Math.abs(action2.weight - 0.5) < 0.001)
    assert(Math.abs(action3.weight - 0.5) < 0.001)
  })
})
