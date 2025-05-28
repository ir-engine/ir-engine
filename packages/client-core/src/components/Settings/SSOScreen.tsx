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

import { GithubOriginalFalse, GoogleOriginalTrue, PlusCircleMd } from '@ir-engine/ui/src/icons'
import React, { useState } from 'react'
import { FaApple, FaMinusCircle } from 'react-icons/fa'
import { SiMicrosoft } from 'react-icons/si'
import Divider from './Divider'
import { MenuItem } from './MenuItem'
import { Section } from './Section'

interface SSOScreenProps {}

interface SSOProvider {
  id: string
  name: string
  icon: React.ReactNode
  connected: boolean
}

const SSOScreen: React.FC<SSOScreenProps> = () => {
  const [providers, setProviders] = useState<SSOProvider[]>([
    {
      id: 'google',
      name: 'Google',
      icon: <GoogleOriginalTrue className="h-6 w-6" />,
      connected: true
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      icon: <SiMicrosoft className="h-6 w-6 text-[#00A4EF]" />,
      connected: false
    },
    {
      id: 'github',
      name: 'Github',
      icon: <GithubOriginalFalse className="h-6 w-6" />,
      connected: false
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: <FaApple className="h-6 w-6" />,
      connected: false
    }
  ])

  const handleProviderClick = (provider: SSOProvider) => {
    if (provider.connected) {
      // Handle disconnection logic here
      console.log(`Disconnecting from ${provider.name}`)
      setProviders((prev) => prev.map((p) => (p.id === provider.id ? { ...p, connected: false } : p)))
    } else {
      // Handle connection logic here
      console.log(`Connecting to ${provider.name}`)
      setProviders((prev) => prev.map((p) => (p.id === provider.id ? { ...p, connected: true } : p)))
    }
  }

  const connectedProviders = providers.filter((p) => p.connected)
  const disconnectedProviders = providers.filter((p) => !p.connected)

  return (
    <div className="space-y-4">
      {/* Connected Section */}
      {connectedProviders.length > 0 && (
        <>
          <div className="mb-2">
            <p className="text-sm text-white/70">Connected:</p>
          </div>
          <Section>
            {connectedProviders.map((provider, index) => (
              <React.Fragment key={provider.id}>
                <MenuItem
                  label={provider.name}
                  onClick={() => handleProviderClick(provider)}
                  leftIcon={provider.icon}
                  rightIcon={<FaMinusCircle />}
                />
                {index < connectedProviders.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Section>
        </>
      )}

      {/* Connect to Section */}
      {disconnectedProviders.length > 0 && (
        <>
          <div className="mb-2">
            <p className="text-sm text-white/70">Connect to:</p>
          </div>
          <Section>
            {disconnectedProviders.map((provider, index) => (
              <React.Fragment key={provider.id}>
                <MenuItem
                  label={provider.name}
                  onClick={() => handleProviderClick(provider)}
                  leftIcon={provider.icon}
                  rightIcon={<PlusCircleMd />}
                  hasChevron
                />
                {index < disconnectedProviders.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Section>
        </>
      )}
    </div>
  )
}

export default SSOScreen
