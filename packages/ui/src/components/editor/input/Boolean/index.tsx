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

export interface BooleanInputProp {
  value: boolean
  onChange: (value: boolean) => void
  onRelease?: (value: boolean) => void
  disabled?: boolean
  className?: string
}

export const BooleanInput = (props: BooleanInputProp) => {
  const onBlur = () => {
    if (props.onRelease) props.onRelease(props.value)
  }

  return (
    <Checkbox
      label=" "
      containerClassName="w-[200px]"
      className={twMerge(
        'rounded-sm border border-none bg-black px-1 py-1 dark:bg-[#1A1A1A]',
        'hover:border-blue-800 hover:bg-zinc-900',
        props.disabled ? 'cursor-[initial] opacity-80 grayscale-[0.8]' : 'cursor-pointer',
        props.className
      )}
      onBlur={onBlur}
      {...props}
    />
  )
}

export default BooleanInput
