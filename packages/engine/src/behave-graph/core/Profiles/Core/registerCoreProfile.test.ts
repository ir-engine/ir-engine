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

import { validateNodeRegistry } from '../../Nodes/Validation/validateNodeRegistry.js'
import { validateValueRegistry } from '../../Values/Validation/validateValueRegistry.js'
import { getCoreRegistry } from './registerCoreProfile.js'

describe('core profile', () => {
  const registry = getCoreRegistry()

  test('validate node registry', () => {
    expect(validateNodeRegistry(registry)).toHaveLength(0)
  })
  test('validate value registry', () => {
    expect(validateValueRegistry(registry.values)).toHaveLength(0)
  })

  const valueTypeNameToExampleValues: { [key: string]: any[] } = {
    boolean: ['true', 'false', true, false],
    string: ['hello'],
    float: [0.9, -0.1, '-999.1', '9e9'],
    integer: [5, -5, '-999', '9223372036854775807'] // mac int64 value
  }

  for (const valueTypeName in valueTypeNameToExampleValues) {
    test(`${valueTypeName} serialization/deserialization`, () => {
      const valueType = registry.values[valueTypeName]
      const exampleValues: any[] = valueTypeNameToExampleValues[valueTypeName]
      exampleValues.forEach((exampleValue: any) => {
        const deserializedValue = valueType.deserialize(exampleValue)
        const serializedValue = valueType.serialize(deserializedValue)
        const redeserializedValue = valueType.deserialize(serializedValue)
        expect(deserializedValue).toBe(redeserializedValue)
        const reserializedValue = valueType.serialize(redeserializedValue)
        expect(serializedValue).toBe(reserializedValue)
      })
    })
  }
})
