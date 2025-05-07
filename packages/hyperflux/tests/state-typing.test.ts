/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { describe, it } from 'vitest'
import { defineAction, defineState, matches, matchesWithDefault } from '..'

describe('State Typing Tests', () => {
  it('should correctly type the state parameter in action receptors', () => {
    // Define an action
    const testAction = defineAction({
      type: 'TEST_ACTION',
      payload: matchesWithDefault(matches.string, () => 'default')
    })

    // Define a state with a specific shape
    type TestStateType = {
      count: number
      message: string
    }

    const TestState = defineState({
      name: 'test.TestState',
      initial: {
        count: 0,
        message: 'hello'
      } as TestStateType,

      receptors: {
        // This should work fine - accessing valid properties
        onTestValid: testAction.receive<TestStateType>((action, state) => {
          // These should be valid operations
          state.count.set(state.count.value + 1)
          state.message.set(action.payload)
        }),

        // This should cause a type error - accessing invalid property
        onTestInvalid: testAction.receive<TestStateType>((action, state) => {
          // @ts-expect-error - This should cause a type error because 'nonExistentProperty' doesn't exist on the state
          state.nonExistentProperty.set('test')
        })
      }
    })

    // Test with explicit type annotation
    const explicitTest = testAction.receive<TestStateType>((action, state) => {
      // This should work
      state.count.set(state.count.value + 1)

      // @ts-expect-error - This should cause a type error
      state.invalidProperty.set('test')
    })
  })
})
