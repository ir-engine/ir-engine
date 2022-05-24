import assert from 'assert'
import { Vector3 } from 'three'

import {
  animationTimeTransitionRule,
  booleanTransitionRule,
  compositeTransitionRule,
  vectorLengthTransitionRule
} from './AnimationStateTransitionsRule'

describe('booleanTransitionRule', () => {
  it('Tests booleanTransitionRule', () => {
    assert(booleanTransitionRule({ test: true }, 'test')())
    assert(booleanTransitionRule({ test: true }, 'test', true)() === false)
  })
})

describe('animationTimeTransitionRule', () => {
  it('Tests animationTimeTransitionRule', () => {
    const action = {
      time: 2.9,
      getClip() {
        return { duration: 3 }
      }
    }

    let rule = animationTimeTransitionRule(action as any, 0.95)
    assert(rule())
    action.time = 0
    assert(rule() === false)

    rule = animationTimeTransitionRule(action as any, 0.5, true)
    assert(rule())
    action.time = 3
    assert(rule() === false)
  })
})

describe('vectorLengthTransitionRule', () => {
  it('Tests vectorLengthTransitionRule', () => {
    assert(vectorLengthTransitionRule(new Vector3(1, 1, 1), 3)())
    assert(vectorLengthTransitionRule(new Vector3(1, 1, 1), 2, true)() === false)
  })
})

describe('compositeTransitionRule', () => {
  it('Will pass', () => {
    const action = {
      time: 2.9,
      getClip() {
        return { duration: 3 }
      }
    }
    const boolRule = booleanTransitionRule({ test: true }, 'test')
    const vecRule = vectorLengthTransitionRule(new Vector3(1, 1, 1), 3)
    const timeRule = animationTimeTransitionRule(action as any, 0.95)

    assert(compositeTransitionRule([boolRule, vecRule, timeRule], 'and')())
    assert(compositeTransitionRule([boolRule, vecRule, timeRule], 'or')())
  })

  it('Will fail', () => {
    const boolRule = booleanTransitionRule({ test: true }, 'test')
    const vecRule = vectorLengthTransitionRule(new Vector3(1, 1, 1), 4)

    assert(compositeTransitionRule([boolRule, vecRule], 'and')() === false)
    assert(compositeTransitionRule([booleanTransitionRule({ test: false }, 'test'), vecRule], 'or')() === false)
  })
})
