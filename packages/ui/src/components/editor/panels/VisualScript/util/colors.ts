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

import { NodeSpecJSON } from '@etherealengine/visual-script'

export type color = 'red' | 'green' | 'lime' | 'purple' | 'blue' | 'gray' | 'white'

export const colors: Record<color, [string, string, string]> = {
  red: ['bg-[#dd6b20]', 'border-[#dd6b20]', 'text-[#fff]'],
  green: ['bg-[#38a169]', 'border-[#38a169]', 'text-[#fff]'],
  lime: ['bg-[#84cc16]', 'border-[#84cc16]', 'text-[#2d3748]'],
  purple: ['bg-[#9f7aea]', 'border-[#9f7aea]', 'text-[#fff]'],
  blue: ['bg-[#22d3ee]', 'border-[#22d3ee]', 'text-[#fff]'],
  gray: ['bg-[#718096]', 'border-[#718096]', 'text-[#fff]'],
  white: ['bg-[#fff]', 'border-[#fff]', 'text-[#4a5568]']
}

export const valueTypeColorMap: Record<string, string> = {
  flow: 'white',
  number: 'green',
  float: 'green',
  integer: 'lime',
  boolean: 'red',
  string: 'purple'
}

export const categoryColorMap: Record<NodeSpecJSON['category'], color> = {
  Event: 'red',
  Logic: 'green',
  Variable: 'purple',
  Query: 'purple',
  Action: 'blue',
  Flow: 'gray',
  Effect: 'lime',
  Time: 'gray',
  None: 'gray'
}
