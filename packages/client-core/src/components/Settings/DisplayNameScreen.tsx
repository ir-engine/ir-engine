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
import React, { useEffect, useRef, useState } from 'react'

interface DisplayNameScreenProps {
  navigateTo: (screenKey: string, historyKey) => void
}

const DisplayNameScreen: React.FC<DisplayNameScreenProps> = ({ navigateTo }) => {
  const [displayName, setDisplayName] = useState('Dan')
  const [showSaveButton, setShowSaveButton] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const handleInputChange = (value: string) => {
    setDisplayName(value)
    setShowSaveButton(value.trim() !== 'Dan' && value.trim() !== '')
  }

  const handleSave = () => {
    setShowSaveButton(false)
    setShowSuccessMessage(true)

    // Hide success message after 2 seconds and navigate back
    setTimeout(() => {
      setShowSuccessMessage(false)
      navigateTo('Settings', 'usernamePassword')
    }, 2000)
  }

  const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div
      className={`overflow-hidden rounded-xl shadow-sm ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      {children}
    </div>
  )

  return (
    <div className="space-y-4">
      <Section>
        <div className="px-4 py-3.5">
          <label className="mb-2 block text-sm font-medium text-white/70">Display Name</label>
          <input
            ref={inputRef}
            type="text"
            value={displayName}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full border-none bg-transparent text-lg font-medium text-white/90 placeholder-white/50 outline-none"
            placeholder="Enter display name"
            style={{
              background: 'none',
              border: 'none',
              outline: 'none'
            }}
          />
          {/* Simulated text cursor/selection */}
          <div className="mt-2 h-px bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 opacity-60"></div>
        </div>
      </Section>

      {/* Save Button */}
      {showSaveButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={handleSave}
            className="w-full rounded-xl py-3.5 font-medium text-white transition-all"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            Save
          </button>
        </motion.div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="rounded-xl px-6 py-4 font-medium text-white shadow-lg">Display Name Updated Successfully</div>
        </motion.div>
      )}
    </div>
  )
}

export default DisplayNameScreen
