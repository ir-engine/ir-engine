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

import React, { useState } from 'react'

interface PermissionsScreenProps {
  navigateTo: (screen: string) => void
}

const PermissionsScreen: React.FC<PermissionsScreenProps> = () => {
  const [cameraPermission, setCameraPermission] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState(false)
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)

  const updatePermissions = async () => {
    try {
      // Request camera permission if enabled
      if (cameraPermission) {
        await navigator.mediaDevices.getUserMedia({ video: true })
      }

      // Request microphone permission if enabled
      if (microphonePermission) {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      // Show success notification
      setShowUpdateNotification(true)
      setTimeout(() => {
        setShowUpdateNotification(false)
      }, 3000)
    } catch (error) {
      console.error('Error updating permissions:', error)
      // You could add error handling here
    }
  }

  const ToggleItem: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({
    label,
    checked,
    onChange
  }) => (
    <div className="flex items-center justify-between px-4 py-3.5 text-white/90">
      <span className="font-medium">{label}</span>
      <button
        className={`relative h-7 w-12 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-white/20'}`}
        onClick={() => onChange(!checked)}
        aria-checked={checked}
        role="switch"
      >
        <span
          className={`absolute top-1 block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )

  const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div
      className={`overflow-hidden rounded-xl shadow-sm ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="divide-y divide-white/10">{children}</div>
    </div>
  )

  const Divider = () => <div className="h-px bg-white/10"></div>

  return (
    <div className="flex h-full flex-col justify-between space-y-6">
      {/* Permissions Section */}
      <div className="space-y-4">
        <Section>
          <ToggleItem label="Camera" checked={cameraPermission} onChange={setCameraPermission} />
          <Divider />
          <ToggleItem label="Microphone" checked={microphonePermission} onChange={setMicrophonePermission} />
        </Section>
      </div>

      {/* Update Button */}
      <div className="pb-4">
        <button
          onClick={updatePermissions}
          className="w-full rounded-full bg-white/20 py-3 text-center font-medium text-white transition-colors hover:bg-white/30"
        >
          Update Permissions
        </button>
      </div>

      {/* Update Notification */}
      {showUpdateNotification && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-gray-800/90 px-6 py-3 text-white">
          Permissions Updated Successfully
        </div>
      )}
    </div>
  )
}

export default PermissionsScreen
