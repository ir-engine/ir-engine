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

import { useHookstate } from '@hookstate/core'
import Divider from '@ir-engine/ui/src/components/viewer/Divider'
import { PlusCircleMd } from '@ir-engine/ui/src/icons'
import { capitalize } from 'lodash'
import React from 'react'
import { FaApple, FaGithub, FaGoogle, FaMinusCircle } from 'react-icons/fa'
import { useAuthSettings, useOAuthState } from '../../hooks/useAuthSetting'
import { AuthService } from '../../user/services/AuthService'
import ButtonGroup from './ButtonGroup'
import { MenuItem } from './MenuItem'
import { Section } from './Section'

interface SSOScreenProps {}

export const Socials = [
  {
    client: 'google',
    label: 'Google',
    icon: <FaGoogle className="h-6 w-6" />
  },
  {
    client: 'apple',
    label: 'Apple',
    icon: <FaApple className="h-6 w-6" />
  },
  {
    client: 'github',
    label: 'GitHub',
    icon: <FaGithub className="h-6 w-6" />
  }
]

const SSOScreen: React.FC<SSOScreenProps> = () => {
  const oauthConnectedState = useOAuthState()
  const authSettings = useAuthSettings()
  const deleteSSO = useHookstate('')

  const handleProviderClick = (client: string) => {
    AuthService.loginUserByOAuth(client, location, true, location.href)
  }

  const connectedProviders = Socials.filter((p) => oauthConnectedState[p.client].value && authSettings[p.client])
  const disconnectedProviders = Socials.filter((p) => !oauthConnectedState[p.client].value && authSettings[p.client])

  const disableProvider = (client: string) => {
    deleteSSO.set(client)
  }

  if (deleteSSO.value) {
    return (
      <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-between pb-2">
        <div className="text-dm-sans m-auto flex w-full flex-1 flex-col justify-center text-center text-2xl text-white">
          Are you sure you want to remove social login from {capitalize(deleteSSO.value)}?
        </div>
        <ButtonGroup
          options={[
            { label: 'Remove', onClick: () => AuthService.removeUserOAuth(deleteSSO.value) },
            { label: 'Nevermind', onClick: () => deleteSSO.set('') }
          ]}
        />
      </div>
    )
  }

  return (
    <div className="h-full space-y-4">
      {/* Connected Section */}
      {connectedProviders.length > 0 && (
        <>
          <div className="mb-2">
            <p className="text-sm text-white/70">Connected:</p>
          </div>
          <Section>
            {connectedProviders.map((provider, index) => (
              <React.Fragment key={provider.client}>
                <MenuItem
                  label={provider.label}
                  onClick={() => disableProvider(provider.client)}
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
              <React.Fragment key={provider.client}>
                <MenuItem
                  label={provider.label}
                  onClick={() => handleProviderClick(provider.client)}
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
