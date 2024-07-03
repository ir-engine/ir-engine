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

import { ValueType } from '../../../VisualScriptModule'
import { Vec4, vec4Equals, Vec4JSON, vec4Mix, vec4Parse } from './internal/Vec4'

export const Vec4Value: ValueType = {
  name: 'vec4',
  creator: () => new Vec4(),
  deserialize: (value: string | Vec4JSON) =>
    typeof value === 'string' ? vec4Parse(value) : new Vec4(value[0], value[1], value[2], value[3]),
  serialize: (value) => [value.x, value.y, value.z, value.w] as Vec4JSON,
  lerp: (start: Vec4, end: Vec4, t: number) => vec4Mix(start, end, t),
  equals: (a: Vec4, b: Vec4) => vec4Equals(a, b),
  clone: (value: Vec4) => value.clone()
}
