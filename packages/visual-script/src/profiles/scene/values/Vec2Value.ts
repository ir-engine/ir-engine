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
import { Vec2, Vec2JSON, vec2Mix, vec2Parse } from './internal/Vec2'

export const Vec2Value: ValueType = {
  name: 'vec2',
  creator: () => new Vec2(),
  deserialize: (value: string | Vec2JSON) =>
    typeof value === 'string' ? vec2Parse(value) : new Vec2(value[0], value[1]),
  serialize: (value) => [value.x, value.y] as Vec2JSON,
  lerp: (start: Vec2, end: Vec2, t: number) => vec2Mix(start, end, t),
  equals: (a: Vec2, b: Vec2) => a.x === b.x && a.y === b.y,
  clone: (value: Vec2) => value.clone()
}
