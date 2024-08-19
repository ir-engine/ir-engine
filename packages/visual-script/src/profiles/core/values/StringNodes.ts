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

import { makeInNOutFunctionDesc } from '../../../VisualScriptModule'

export const Constant = makeInNOutFunctionDesc({
  name: 'logic/string/constant',
  label: 'String',
  in: ['string'],
  out: 'string',
  exec: (a: string) => a
})

export const Concat = makeInNOutFunctionDesc({
  name: 'logic/string/concat',
  label: 'Concat',
  in: ['string', 'string'],
  out: 'string',
  exec: (a: string, b: string) => a.concat(b)
})

export const Includes = makeInNOutFunctionDesc({
  name: 'logic/string/includes',
  label: 'Includes',
  in: ['string', 'string'],
  out: 'boolean',
  exec: (a: string, b: string) => a.includes(b)
})

export const Length = makeInNOutFunctionDesc({
  name: 'logic/string/length',
  label: 'Length',
  in: ['string'],
  out: 'integer',
  exec: (a: string) => BigInt(a.length)
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/string/compare/equal',
  label: '=',
  in: ['string', 'string'],
  out: 'boolean',
  exec: (a: string, b: string) => a === b
})
