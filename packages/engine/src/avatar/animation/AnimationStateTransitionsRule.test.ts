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
    const rule = {
      object: { test: true },
      property: 'test',
      negate: false
    }

    assert(booleanTransitionRule(rule as any))
    rule.negate = true
    assert(booleanTransitionRule(rule as any) === false)
  })
})

describe('animationTimeTransitionRule', () => {
  it('Tests animationTimeTransitionRule', () => {
    const rule = {
      action: {
        time: 2.9,
        getClip() {
          return { duration: 3 }
        }
      },
      threshold: 0.95
    }

    assert(animationTimeTransitionRule(rule as any))
    rule.action.time = 0
    assert(animationTimeTransitionRule(rule as any) === false)
  })
})

describe('vectorLengthTransitionRule', () => {
  it('Tests vectorLengthTransitionRule', () => {
    const rule = {
      value: new Vector3(1, 1, 1),
      threshold: 3
    }
    assert(vectorLengthTransitionRule(rule as any))
  })
})

describe('compositeTransitionRule', () => {
  it('Will pass', () => {
    const boolRule = {
      type: 'BooleanTransitionRule',
      object: { test: true },
      property: 'test',
      negate: false
    }
    const vecRule = {
      type: 'VectorLengthTransitionRule',
      value: new Vector3(1, 1, 1),
      threshold: 3
    }
    const timeRule = {
      type: 'AnimationTimeTransitionRule',
      action: {
        time: 2.9,
        getClip() {
          return { duration: 3 }
        }
      },
      threshold: 0.95
    }

    const compositeRule = {
      rules: [boolRule, vecRule, timeRule],
      operator: 'and'
    }

    assert(compositeTransitionRule(compositeRule as any))
    compositeRule.operator = 'or'
    boolRule.object.test = false
    vecRule.threshold = 5
    assert(compositeTransitionRule(compositeRule as any))
  })

  it('Will fail', () => {
    const boolRule = {
      type: 'BooleanTransitionRule',
      object: { test: true },
      property: 'test',
      negate: false
    }
    const vecRule = {
      type: 'VectorLengthTransitionRule',
      value: new Vector3(1, 1, 1),
      threshold: 4
    }

    const compositeRule = {
      rules: [boolRule, vecRule],
      operator: 'and'
    }

    assert(compositeTransitionRule(compositeRule as any) === false)

    compositeRule.operator = 'or'
    boolRule.object.test = false

    assert(compositeTransitionRule(compositeRule as any) === false)
  })
})
