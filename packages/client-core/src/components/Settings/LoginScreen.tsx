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
import { validateEmail } from '@ir-engine/common/src/config'
import { PlusCircleMd } from '@ir-engine/ui/src/icons'
import { Divider } from '@ir-engine/ui/viewer'
import React, { useEffect } from 'react'
import { FaApple, FaGithub, FaGoogle, FaLink, FaMicrosoft } from 'react-icons/fa'
import { useAuthSettings } from '../../hooks/useAuthSetting'
import { useMagicLink } from '../../hooks/useMagicLink'
import { AuthService } from '../../user/services/AuthService'
import { TextButton } from '../Glass/buttons/TextButton'
import FieldItem from './FieldItem'
import { MenuItem } from './MenuItem'
import { Section } from './Section'

// Extended Socials array to include Microsoft
const LoginSocials = [
  {
    client: 'google',
    label: 'Google',
    icon: <FaGoogle className="h-6 w-6" />
  },
  {
    client: 'microsoft',
    label: 'Microsoft',
    icon: <FaMicrosoft className="h-6 w-6" />
  },
  {
    client: 'github',
    label: 'Github',
    icon: <FaGithub className="h-6 w-6" />
  },
  {
    client: 'apple',
    label: 'Apple',
    icon: <FaApple className="h-6 w-6" />
  }
]

export default function LoginScreen() {
  const username = useHookstate('')
  const email = useHookstate('')
  const isValid = useHookstate(false)

  const { pending, handleMagicLink, sent } = useMagicLink()

  const onMagicLinkClick = async () => {
    sent.set(true)
    await handleMagicLink(email.value, false)
  }

  useEffect(() => {
    isValid.set(validateEmail(email.value))
  }, [email.value])

  const authSettings = useAuthSettings()

  const handleProviderClick = (client: string) => {
    AuthService.loginUserByOAuth(client, location, false)
  }

  const availableProviders = LoginSocials.filter((p) => authSettings[p.client])

  const disableMagicLink = pending.value || sent.value || !isValid.value

  return (
    <div className="flex min-h-full flex-col gap-4">
      {/* Username Field */}
      <Section>
        <FieldItem type="text" label="Username" onChange={username.set} value={username.value} />
      </Section>

      {/* Email Field */}
      <Section>
        <FieldItem type="email" label="Email" onChange={email.set} value={email.value} />
      </Section>

      {/* Magic Link Button */}
      <TextButton
        disabled={disableMagicLink}
        onClick={onMagicLinkClick}
        className="text-md mx-auto mt-4 flex w-full justify-center gap-2"
      >
        {sent.value ? 'Sent!' : 'Send magic link'}
        <FaLink />
      </TextButton>

      {/* Or Connect to Section */}
      <div className="mt-4">Or Connect to:</div>
      <Section>
        {availableProviders.map((provider, index) => (
          <React.Fragment key={provider.client}>
            <MenuItem
              label={provider.label}
              onClick={() => handleProviderClick(provider.client)}
              leftIcon={provider.icon}
              rightIcon={<PlusCircleMd />}
              hasChevron
            />
            {index < availableProviders.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Section>
    </div>
  )
}
