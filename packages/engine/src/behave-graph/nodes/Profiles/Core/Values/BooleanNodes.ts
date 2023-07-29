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

import { makeInNOutFunctionDesc } from '../../../Nodes/FunctionNode'

export const Constant = makeInNOutFunctionDesc({
  name: 'math/boolean',
  label: 'Boolean',
  in: ['boolean'],
  out: 'boolean',
  exec: (a: boolean) => a
})

export const And = makeInNOutFunctionDesc({
  name: 'math/and/boolean',
  label: '∧',
  in: ['boolean', 'boolean'],
  out: 'boolean',
  exec: (a: boolean, b: boolean) => a && b
})

export const Or = makeInNOutFunctionDesc({
  name: 'math/or/boolean',
  label: '∨',
  in: ['boolean', 'boolean'],
  out: 'boolean',
  exec: (a: boolean, b: boolean) => a || b
})

export const Not = makeInNOutFunctionDesc({
  name: 'math/negate/boolean',
  label: '¬',
  in: ['boolean'],
  out: 'boolean',
  exec: (a: boolean) => !a
})

export const ToFloat = makeInNOutFunctionDesc({
  name: 'math/toFloat/boolean',
  label: 'To Float',
  in: ['boolean'],
  out: 'float',
  exec: (a: boolean) => (a ? 1 : 0)
})

export const Equal = makeInNOutFunctionDesc({
  name: 'math/equal/boolean',
  label: '=',
  in: ['boolean', 'boolean'],
  out: 'boolean',
  exec: (a: boolean, b: boolean) => a === b
})

export const toInteger = makeInNOutFunctionDesc({
  name: 'math/toInteger/boolean',
  label: 'To Integer',
  in: ['boolean'],
  out: 'integer',
  exec: (a: boolean) => (a ? 1n : 0n)
})
