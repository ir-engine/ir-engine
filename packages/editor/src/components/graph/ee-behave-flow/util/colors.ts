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

import { NodeSpecJSON } from 'behave-graph'

export const colors: Record<string, [string, string, string]> = {
  red: ['bg-orange-700', 'border-orange-700', 'text-white'],
  green: ['bg-green-600', 'border-green-600', 'text-white'],
  lime: ['bg-lime-500', 'border-lime-500', 'text-white'],
  purple: ['bg-purple-500', 'border-purple-500', 'text-white'],
  blue: ['bg-cyan-600', 'border-cyan-600', 'text-white'],
  gray: ['bg-gray-500', 'border-gray-500', 'text-white'],
  white: ['bg-white', 'border-white', 'text-gray-700']
}

export const valueTypeColorMap: Record<string, string> = {
  flow: 'white',
  number: 'green',
  float: 'green',
  integer: 'lime',
  boolean: 'red',
  string: 'purple'
}

export const categoryColorMap: Record<NodeSpecJSON['category'], string> = {
  Event: 'red',
  Logic: 'green',
  Variable: 'purple',
  Query: 'purple',
  Action: 'blue',
  Flow: 'gray',
  Time: 'gray',
  None: 'gray'
}
