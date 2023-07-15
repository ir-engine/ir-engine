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
