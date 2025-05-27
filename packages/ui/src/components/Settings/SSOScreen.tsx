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

interface SSOScreenProps {
  navigateTo: (screen: string) => void
}

interface SSOProvider {
  id: string
  name: string
  icon: string
  connected: boolean
  color: string
}

const SSOScreen: React.FC<SSOScreenProps> = ({ navigateTo }) => {
  const [providers, setProviders] = useState<SSOProvider[]>([
    {
      id: 'google',
      name: 'Google',
      icon: '🔍',
      connected: true,
      color: 'bg-red-500'
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      icon: '🪟',
      connected: false,
      color: 'bg-blue-500'
    },
    {
      id: 'github',
      name: 'Github',
      icon: '🐙',
      connected: false,
      color: 'bg-gray-800'
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: '🍎',
      connected: false,
      color: 'bg-gray-900'
    }
  ])

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleProviderClick = (provider: SSOProvider) => {
    if (provider.connected) {
      setSelectedProvider(provider)
      setShowConfirmDialog(true)
    } else {
      // Handle connection logic here
      console.log(`Connecting to ${provider.name}`)
      // You would implement the actual SSO connection logic here
    }
  }

  const handleRemoveProvider = () => {
    if (selectedProvider) {
      setProviders((prev) => prev.map((p) => (p.id === selectedProvider.id ? { ...p, connected: false } : p)))
      setShowConfirmDialog(false)
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    }
  }

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

  const ProviderItem: React.FC<{ provider: SSOProvider }> = ({ provider }) => (
    <div
      className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-white/90 transition-colors hover:bg-white/5"
      onClick={() => handleProviderClick(provider)}
    >
      <div className="flex items-center space-x-3">
        <div className={`flex h-6 w-6 items-center justify-center rounded text-sm ${provider.color}`}>
          {provider.icon}
        </div>
        <span className="font-medium">{provider.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        {provider.connected && <span className="text-xs font-medium text-green-400">Connected</span>}
        <button
          className={`relative h-7 w-12 rounded-full transition-colors ${
            provider.connected ? 'bg-blue-500' : 'bg-white/20'
          }`}
          aria-checked={provider.connected}
          role="switch"
        >
          <span
            className={`absolute top-1 block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
              provider.connected ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>
    </div>
  )

  if (showConfirmDialog && selectedProvider) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-6 p-6 text-center">
        <div className="space-y-4">
          <p className="text-lg text-white/90">Are you sure you want to remove social login from</p>
          <p className="text-xl font-semibold text-white">{selectedProvider.name}?</p>
        </div>

        <div className="flex w-full max-w-xs space-x-4">
          <button
            onClick={handleRemoveProvider}
            className="flex-1 rounded-full bg-red-500/80 py-3 text-center font-medium text-white transition-colors hover:bg-red-500"
          >
            Remove
          </button>
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="flex-1 rounded-full bg-white/20 py-3 text-center font-medium text-white transition-colors hover:bg-white/30"
          >
            Nevermind
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="mb-4 text-sm text-white/70">Connect to:</p>
      </div>

      <Section>
        {providers.map((provider, index) => (
          <React.Fragment key={provider.id}>
            <ProviderItem provider={provider} />
            {index < providers.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Section>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-gray-800/90 px-6 py-3 text-white">
          Social Login Removed Successfully.
        </div>
      )}
    </div>
  )
}

export default SSOScreen
