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

import { GlassButton } from '@ir-engine/ui/src/components/viewer/Button'
import { motion } from 'motion/react'
import React from 'react'

interface ButtonOption {
  label: string
  onClick: () => void
  isPrimary?: boolean
}

interface ButtonGroupProps {
  options: ButtonOption[]
  className?: string
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ options, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: 0.1,
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`flex w-full max-w-xs flex-col items-center space-y-3 ${className}`}
    >
      {options.map((option, index) => (
        <motion.div key={index} variants={itemVariants} className="w-full">
          <GlassButton
            onClick={option.onClick}
            className="w-full rounded-xl py-3.5 font-medium text-white transition-all hover:scale-105"
          >
            {option.label}
          </GlassButton>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ButtonGroup
