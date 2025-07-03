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

import { CheckLg } from '@ir-engine/ui/src/icons'
import { motion } from 'motion/react'
import React from 'react'

interface CheckboxItemProps extends React.PropsWithChildren {
  label?: string
  checked?: boolean
  onClick?: () => void
  disabled?: boolean
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, checked = false, onClick, disabled = false, children }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 text-white/90">
      {children || <span className="font-medium">{label}</span>}
      <div className="relative">
        <button
          className={`relative h-6 w-6 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
          onClick={disabled ? undefined : onClick}
          aria-checked={checked}
          role="checkbox"
          disabled={disabled}
        >
          {/* Box border that fades out and shrinks when checked */}
          <motion.div
            className="absolute inset-0 rounded-md border-2 border-white"
            initial={false}
            animate={{
              scale: checked ? 0.8 : 1,
              opacity: checked ? 0 : 1
            }}
            transition={{
              type: 'tween',
              ease: 'circOut',
              duration: 0.1
            }}
          />

          {/* Checkmark that appears when checked */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={false}
            animate={{
              scale: checked ? 1 : 0,
              opacity: checked ? 1 : 0
            }}
            transition={{
              type: 'tween',
              ease: 'circOut',
              duration: checked ? 0.15 : 0.1,
              delay: checked ? 0.05 : 0
            }}
          >
            <CheckLg className="h-7 w-7 text-white" strokeWidth={2.5} />
          </motion.div>
        </button>
      </div>
    </div>
  )
}

export default CheckboxItem
