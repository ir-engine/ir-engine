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
import { Gate } from './Gate.js'

type RecordedWritesType = RecordedWritesOrCommits<typeof Gate.out>

const generateTrigger = () => generateTriggerTester(Gate)

const flowTriggeredOutput: RecordedWritesType = [
  {
    outputType: RecordedOutputType.commit,
    socketName: 'flow'
  }
]

describe('Gate', () => {
  describe('when the `flow` node is triggered', () => {
    describe('when the gate starts closed', () => {
      const inputVals = {
        startClosed: true
      }
      it('does nothing', () => {
        const trigger = generateTrigger()
        const outputs = trigger({
          triggeringSocketName: 'flow',
          inputVals
        })

        expect(outputs).toHaveLength(0)
      })
      describe('when the gate is opened', () => {
        it('commits to the flow output', () => {
          const trigger = generateTrigger()

          // initial trigger
          trigger({
            triggeringSocketName: 'flow',
            inputVals
          })

          trigger({ triggeringSocketName: 'open', inputVals })

          const outputs = trigger({ triggeringSocketName: 'flow', inputVals })

          expect(outputs).toEqual(flowTriggeredOutput)
        })
      })
    })
    describe('when the gate starts opened (by default)', () => {
      it('commits to the flow output', () => {
        const trigger = generateTrigger()

        const outputs = trigger({
          triggeringSocketName: 'flow'
        })

        expect(outputs).toHaveLength(1)

        expect(outputs).toEqual(flowTriggeredOutput)
      })
      describe('when the gate is closed', () => {
        it('does nothing', () => {
          const trigger = generateTrigger()

          trigger({
            triggeringSocketName: 'flow'
          })

          // close the gate
          trigger({ triggeringSocketName: 'close' })

          // triggering shouldn't do anything
          expect(trigger({ triggeringSocketName: 'flow' })).toHaveLength(0)
        })
      })
    })
    describe('when the gate is toggled', () => {
      it('will commit if it should be opened', () => {
        const trigger = generateTrigger()

        // by default, something should trigger
        expect(trigger({ triggeringSocketName: 'flow' })).toEqual(flowTriggeredOutput)

        trigger({ triggeringSocketName: 'toggle' })
        expect(trigger({ triggeringSocketName: 'flow' })).toHaveLength(0)

        trigger({ triggeringSocketName: 'toggle' })
        expect(trigger({ triggeringSocketName: 'flow' })).toEqual(flowTriggeredOutput)
      })
    })
  })
})
