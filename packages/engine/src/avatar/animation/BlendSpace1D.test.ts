import assert from 'assert'
import proxyquire from 'proxyquire'

import { AnimationGraph } from './AnimationGraph'
import { BooleanTransitionRule } from './AnimationStateTransitionsRule'
import { addBlendSpace1DNode } from './BlendSpace1D'
import { SingleAnimationState } from './singleAnimationState'

describe('addBlendSpace1DNode', () => {
  it('Will test node addition', () => {
    const bs = {
      minValue: 0,
      maxValue: 1,
      nodes: [] as any
    }
    const position = 1
    const action = {}
    const data = {}

    addBlendSpace1DNode(bs, action as any, position, data)

    assert(bs.nodes.length === 1)
    assert(bs.nodes[0].action === action)
    assert(bs.nodes[0].weight === 0)
    assert(bs.nodes[0].position === position)
    assert(bs.nodes[0].data === data)
  })

  it('Will sort nodes', () => {
    const bs = {
      minValue: 0,
      maxValue: 1,
      nodes: [] as any
    }
    const position1 = 1
    const action1 = {}
    const position2 = 0
    const action2 = {}

    addBlendSpace1DNode(bs, action1 as any, position1)
    addBlendSpace1DNode(bs, action2 as any, position2)

    assert(bs.nodes.length === 2)
    assert(bs.nodes[0].position === position2)
    assert(bs.nodes[1].position === position1)
  })
})
