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

import { motion } from 'motion/react'
import React from 'react'

export interface ToggleProps {
  checked: boolean
  onChange?: () => void
  className?: string
  disabled?: boolean
}

/**
 * A reusable toggle component with motion animation and custom styling
 */
const Toggle: React.FC<ToggleProps> = ({ checked, onChange, className = '', disabled = false }) => {
  return (
    <div className={`relative h-7 w-12 ${className}`}>
      <button
        className={`absolute left-0 top-0 h-7 w-12 rounded-full shadow-md ${
          checked ? 'bg-primary-blue' : 'bg-inactive-input'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        onClick={disabled ? undefined : onChange}
        aria-checked={checked}
        role="switch"
        disabled={disabled}
      />
      <motion.div
        className="shadow-0px_3px_8px_0px_rgba(0,0,0,0.15) pointer-events-none absolute top-[2px] size-6 rounded-full bg-white"
        animate={{
          left: checked ? '22px' : '4px'
        }}
        transition={{
          type: 'tween',
          ease: 'circOut',
          duration: 0.2
        }}
      />
    </div>
  )
}

export default Toggle
