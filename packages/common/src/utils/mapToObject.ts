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

import { cloneDeep, merge } from 'lodash-es'

export const mapToObject = <K extends string | number, V>(map: Map<K, V>): Record<K, V> =>
  Array.from(map.entries()).reduce((obj, [key, value]) => {
    return merge({ [key]: value }, obj)
  }, {}) as any

export const iterativeMapToObject = (root: Record<any, any>) => {
  const seen = new Set()
  const iterate = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj
    const output = {}
    for (const [key, value] of Object.entries(obj)) {
      if (seen.has(value)) continue
      if (typeof value === 'object') seen.add(value)
      if (!value) {
        output[key] = value
      } else if (value instanceof Map && value) {
        output[key] = mapToObject(value)
      } else if (Array.isArray(value)) {
        output[key] = [...value.map((val) => iterate(val))]
      } else {
        output[key] = iterate(value)
      }
    }
    return output
  }
  return cloneDeep(iterate(root))
}
