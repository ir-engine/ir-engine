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

import React, { useId, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'
import InputBase, { InputBaseProps } from '../InputBase'
import InputLabel from '../InputBase/InputLabel'

export interface InputProps extends InputBaseProps {
  labelText: string
  labelPosition: 'top' | 'left'
  infoText?: string
}

const Input = (
  { labelText, labelPosition, infoText, required, fullWidth, id, ...props }: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) => {
  const tempId = useId()
  const inputId = id || tempId

  const containerClass = useMemo(() => {
    let _class = `flex ${fullWidth ? 'w-full' : 'w-fit'}`

    if (labelPosition === 'top') {
      _class = twMerge(_class, 'flex-col items-start gap-y-2')
    } else if (labelPosition === 'left') {
      _class = twMerge(_class, 'flex-row items-center gap-x-2')
    }

    return _class
  }, [labelText, labelPosition, fullWidth])

  return (
    <div className={containerClass}>
      <InputLabel htmlFor={inputId} labelText={labelText} infoText={infoText} required={required} />
      <InputBase id={inputId} required={required} {...props} ref={ref} />
    </div>
  )
}

export default React.forwardRef(Input)
