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

import { CheckSm } from '@ir-engine/ui/src/icons'
import { motion } from 'motion/react'
import React, { useState } from 'react'

interface DeleteAccountScreenProps {
  navigateTo: (screenKey: string, historyKey: string) => void
  navigateClose: () => void
}

const DeleteAccountScreen: React.FC<DeleteAccountScreenProps> = ({ navigateTo, navigateClose }) => {
  const [showConfirmation, setShowConfirmation] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleDelete = () => {
    setShowConfirmation(false)
    setShowSuccess(true)
  }

  const handleStayHere = () => {
    navigateTo('Settings', 'account')
  }

  const handleClose = () => {
    navigateClose()
  }

  if (showSuccess) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-8 text-center">
        {/* Success Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex h-16 w-16 items-center justify-center rounded-full"
        >
          <CheckSm className="h-8 w-8 text-white" />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex flex-col gap-2"
        >
          <p className="text-lg font-medium text-white/90">Your account has been</p>
          <p className="text-lg font-medium text-white/90">successfully deleted.</p>
        </motion.div>

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          onClick={handleClose}
          className="w-full max-w-xs rounded-xl py-3.5 font-medium text-white transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          Close
        </motion.button>
      </div>
    )
  }

  if (showConfirmation) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-8 text-center">
        {/* Confirmation Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <p className="text-lg font-medium text-white/90">Are you sure you want to</p>
          <p className="text-lg font-medium text-white/90">delete your account?</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="w-full max-w-xs space-y-3"
        >
          {/* Stay Here Button */}
          <button
            onClick={handleStayHere}
            className="w-full rounded-xl py-3.5 font-medium text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            Stay Here
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="w-full rounded-xl py-3.5 font-medium text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            Delete
          </button>
        </motion.div>
      </div>
    )
  }

  return null
}

export default DeleteAccountScreen
