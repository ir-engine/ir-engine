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

import { testExec } from '../../../Nodes/testUtils.js'
import { toInteger } from './BooleanNodes.js'
import { toBoolean as intToBoolean } from './IntegerNodes.js'

describe('Boolean Conversions', () => {
  describe('math/toBoolean/integer', () => {
    it('writes to the output false when the input value is 0', () => {
      const outputs = testExec({
        exec: intToBoolean.exec,
        nodeInputVals: {
          a: 0n
        }
      })

      expect(outputs['result']).toEqual(false)
    })
    it('writes to the output true when the input value is non-zero', () => {
      const outputs = testExec({
        exec: intToBoolean.exec,
        // test with value 1
        nodeInputVals: {
          a: 1n
        }
      })
      expect(outputs['result']).toEqual(true)

      const secondResult = testExec({
        exec: intToBoolean.exec,
        // test with value to 5
        nodeInputVals: {
          a: 5n
        }
      })

      expect(secondResult['result']).toEqual(true)
    })
  })

  describe('math/toInteger/boolean', () => {
    it('writes to the output 1 when the input value is true', () => {
      const output = testExec({
        exec: toInteger.exec,
        nodeInputVals: {
          a: true
        }
      })
      expect(output['result']).toEqual(1n)
    })
    it('writes to the output 0 when the input value is false', () => {
      const output = testExec({
        exec: toInteger.exec,
        nodeInputVals: { a: false }
      })
      expect(output['result']).toEqual(0n)
    })
  })
})
