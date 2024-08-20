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

import { ValueType } from '../../../VisualScriptModule'
import { Mat4, mat4Equals, Mat4JSON, mat4Mix, mat4Parse } from './internal/Mat4'

export const Mat4Value: ValueType = {
  name: 'mat4',
  creator: () => new Mat4(),
  deserialize: (value: string | Mat4JSON) => (typeof value === 'string' ? mat4Parse(value) : new Mat4(value)),
  serialize: (value) => value.elements as Mat4JSON,
  lerp: (start: Mat4, end: Mat4, t: number) => mat4Mix(start, end, t),
  equals: (a: Mat4, b: Mat4) => mat4Equals(a, b),
  clone: (value: Mat4) => value.clone()
}
