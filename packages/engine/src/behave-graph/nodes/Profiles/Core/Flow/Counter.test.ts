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

import { generateTriggerTester, RecordedOutputType, RecordedWritesOrCommits } from '../../../Nodes/testUtils.js'
import { Counter } from './Counter.js'

type RecordedWritesType = RecordedWritesOrCommits<typeof Counter.out>

describe('Counter', () => {
  describe('when the flow node is triggered', () => {
    it('should increase the count then commit to the flow node', () => {
      // create a flow node tester

      const trigger = generateTriggerTester(Counter)

      // trigger to count 1
      trigger({
        triggeringSocketName: 'flow'
      })

      // trigger to count 2
      const recordedOutputs = trigger({
        triggeringSocketName: 'flow'
      })

      expect(recordedOutputs).toHaveLength(2)

      const expectedOutputs: RecordedWritesType = [
        {
          outputType: RecordedOutputType.write,
          socketName: 'count',
          value: 2
        },
        {
          outputType: RecordedOutputType.commit,
          socketName: 'flow'
        }
      ]

      expect(recordedOutputs).toEqual(expectedOutputs)
    })
  })
  describe('when the reset node is triggered', () => {
    it('should reset to 0 but not write to any outputs', () => {
      const trigger = generateTriggerTester(Counter)

      // trigger first count
      trigger({
        triggeringSocketName: 'flow'
      })
      // trigger to second count
      trigger({
        triggeringSocketName: 'flow'
      })

      // reset to 0 - should not have a write or commit
      const resetRecordedOutputs = trigger({
        triggeringSocketName: 'reset'
      })

      // make sure there were no recorded outputs
      expect(resetRecordedOutputs).toHaveLength(0)

      // trigger a counter increment; it should have a write with value one and commit to the flow
      const outputs = trigger({ triggeringSocketName: 'flow' })
      const expectedOutputs: RecordedWritesType = [
        {
          outputType: RecordedOutputType.write,
          socketName: 'count',
          value: 1
        },
        {
          outputType: RecordedOutputType.commit,
          socketName: 'flow'
        }
      ]

      expect(outputs).toEqual(expectedOutputs)
    })
  })
})
