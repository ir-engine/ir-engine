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

import { ChevronRightSm } from '@ir-engine/ui/src/icons'
import React, { useState } from 'react'

interface UsernamePasswordScreenProps {
  navigateTo: (screen: string) => void
}

const UsernamePasswordScreen: React.FC<UsernamePasswordScreenProps> = ({ navigateTo }) => {
  const [displayName, setDisplayName] = useState('Dan')
  const [userId, setUserId] = useState('chatterbox_885')
  const [password, setPassword] = useState('••••••••••••')

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

  const FieldItem: React.FC<{
    label: string
    value: string
    onClick: () => void
    isPassword?: boolean
  }> = ({ label, value, onClick, isPassword = false }) => (
    <div
      className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-white/90 transition-colors hover:bg-white/5"
      onClick={onClick}
    >
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center space-x-2">
        <span className={`text-white/70 ${isPassword ? 'font-mono' : ''}`}>{value}</span>
        <ChevronRightSm className="text-white/70" />
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <Section>
        <FieldItem label="Display Name" value={displayName} onClick={() => navigateTo('displayName')} />
        <Divider />
        <FieldItem label="User ID" value={userId} onClick={() => navigateTo('userId')} />
        <Divider />
        <FieldItem label="Password" value={password} onClick={() => navigateTo('password')} isPassword={true} />
      </Section>
    </div>
  )
}

export default UsernamePasswordScreen
