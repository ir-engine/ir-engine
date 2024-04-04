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

import CheckIcon from '@mui/icons-material/Check'
import React, { KeyboardEvent, useState } from 'react'
import { twMerge } from 'tailwind-merge'

let uniqueId = 0

interface BooleanInputProp {
  value: boolean
  onChange: (value: boolean) => void
  onRelease?: (value: boolean) => void
  disabled?: boolean
}

export const BooleanInput = (props: BooleanInputProp) => {
  const [checkboxId] = useState(() => `boolean-input-${uniqueId++}`)
  const labelStyle = twMerge([
    'm-0 h-6 rounded border border-solid border-[color:var(--inputOutline)] bg-[color:var(--inputBackground)] px-2 py-1.5 text-[color:var(--textColor)] hover:border-[color:var(--blueHover)] focus:border-[color:var(--blue)] disabled:bg-[color:var(--disabled)] disabled:text-[color:var(--disabledText)]',
    'flex h-[18px] w-[18px] items-center justify-center p-0',
    props.disabled ? 'cursor-[initial] opacity-80 grayscale-[0.8]' : 'cursor-pointer'
  ])
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(e.target.checked)
  }

  const onBlur = () => {
    if (props.onRelease) props.onRelease(props.value)
  }

  const onKeyPress = (e: KeyboardEvent<HTMLLabelElement>) => {
    if (e.key === 'Enter' || e.key === ' ') props.onChange(!props.value)
  }

  return (
    <div className="checkbox flex items-center justify-center">
      <input
        id={checkboxId}
        className="m-0 hidden"
        type="checkbox"
        checked={props.value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={props.disabled}
      />
      <label htmlFor={checkboxId} className={labelStyle} tabIndex={0} onKeyPress={onKeyPress}>
        {props.value && <CheckIcon className="h-auto w-full text-[color:var(--buttonTextColor)]" />}
      </label>
    </div>
  )
}

export default BooleanInput
