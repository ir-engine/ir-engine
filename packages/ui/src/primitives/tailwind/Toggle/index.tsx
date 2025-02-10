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

import React from 'react'
import { twMerge } from 'tailwind-merge'

import Label from '../Label'

const sizeMap = {
  sm: 'w-9 h-5 after:w-4 after:h-4',
  md: 'w-11 h-6 after:w-5 after:h-5'
} as const

export interface ToggleProps {
  value: boolean
  size?: keyof typeof sizeMap
  label?: string
  className?: string
  onChange: (value: boolean) => void
  disabled?: boolean
}

const Toggle = ({ size, label, value, onChange, disabled }: ToggleProps) => {
  return (
    <div
      className={twMerge('flex items-center gap-4', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
      data-testid="toggle-input-container"
    >
      <input
        data-testid="toggle-input"
        disabled={disabled}
        type="checkbox"
        className="peer sr-only"
        checked={value}
        onChange={() => onChange(!value)}
      />
      <div
        className={twMerge(
          "peer relative rounded-full border border-ui-outline after:absolute after:left-[0.0625rem] after:top-1/2 after:-translate-y-1/2  after:rounded-full after:transition-all after:content-['']",
          'peer-checked:border-ui-inactive-primary peer-checked:after:translate-x-full peer-checked:after:border-ui-outline',
          'peer-disabled:ui-inactive-background peer-disabled:pointer-events-none',
          sizeMap[size ?? 'md'],
          disabled
            ? 'bg-ui-inactive-background after:bg-text-inactive peer-checked:bg-ui-inactive-primary'
            : 'bg-ui-background after:bg-text-primary peer-checked:bg-ui-primary'
        )}
        onClick={() => onChange(!value)}
      />
      {label && <Label data-testid="toggle-input-label">{label}</Label>}
    </div>
  )
}

export default Toggle
