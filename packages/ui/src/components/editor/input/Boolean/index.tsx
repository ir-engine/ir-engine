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

import React from 'react'
import { twMerge } from 'tailwind-merge'
import Checkbox from '../../../../primitives/tailwind/Checkbox'

let uniqueId = 0

export interface BooleanInputProp {
  value: boolean
  onChange: (value: boolean) => void
  onRelease?: (value: boolean) => void
  disabled?: boolean
}

export const BooleanInput = (props: BooleanInputProp) => {
  const labelClassName = twMerge([
    'h-[21px] w-[22px] rounded-sm border px-1 py-1',
    props.value ? 'border-blue-800 bg-zinc-900 ' : 'border-zinc-800 bg-neutral-900',
    'hover: bg-zinc-900 hover:border-blue-800',
    props.disabled ? 'cursor-[initial] opacity-80 grayscale-[0.8]' : 'cursor-pointer'
  ])

  const onBlur = () => {
    if (props.onRelease) props.onRelease(props.value)
  }

  return (
    <Checkbox
      className={labelClassName}
      value={props.value}
      onChange={props.onChange}
      onBlur={onBlur}
      disabled={props.disabled}
      // icon={
      //   <svg
      //     className="h-full w-full"
      //     width="12"
      //     height="9"
      //     viewBox="0 0 12 9"
      //     fill="none"
      //     xmlns="http://www.w3.org/2000/svg"
      //   >
      //     <path
      //       d="M11 1L4.125 8L1 4.81818"
      //       stroke="#375DAF"
      //       stroke-width="1.5"
      //       stroke-linecap="round"
      //       stroke-linejoin="round"
      //     />
      //   </svg>
      // }
    />
  )
}

export default BooleanInput
