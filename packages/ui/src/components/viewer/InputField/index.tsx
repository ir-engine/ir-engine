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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { XCloseMd } from '@ir-engine/ui/src/icons'
import React from 'react'

export interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  value: string
  isPassword?: boolean
  onChange: (value: string) => void
  onReset?: () => void
  isDirty?: boolean
  className?: string
}

/**
 * A reusable input field component with reset functionality
 */
const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, value, isPassword = false, onChange, isDirty = false, onReset, className = '', ...props }, ref) => (
    <div className={`flex max-w-[25ch] flex-1 items-center gap-2 ${className}`}>
      <input
        ref={ref}
        type={isPassword || props.type === 'password' ? 'password' : 'text'}
        className="w-full bg-transparent text-right placeholder:text-white/20 focus-visible:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        {...props}
      />

      <button onClick={onReset} className={isDirty ? 'visible' : 'invisible'} aria-label={`Reset ${label}`}>
        <XCloseMd className="h-4 w-4 text-white/70" />
      </button>
    </div>
  )
)

InputField.displayName = 'InputField'

export default InputField
