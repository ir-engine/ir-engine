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
import useEngineSetting from '@ir-engine/common/src/hooks/useEngineSetting'
import { ClientEngineSettingType } from '@ir-engine/server-core/src/appconfig'
import { PlusCircleMd } from '@ir-engine/ui/src/icons'
import { Divider, Link } from '@ir-engine/ui/viewer'
import React, { useEffect, useState } from 'react'
import { FaLink } from 'react-icons/fa'
import { NotificationService } from '../../common/services/NotificationService'
import { useAuthSettings, useOAuthState } from '../../hooks/useAuthSetting'
import { useMagicLink } from '../../hooks/useMagicLink'
import { AuthService } from '../../user/services/AuthService'
import { TextButton } from '../Glass/buttons/TextButton'
import { Inner } from '../Glass/ToolbarAndSidebar'
import FieldItem from './FieldItem'
import { MenuItem } from './MenuItem'
import { Section } from './Section'
import { Socials } from './SSOScreen'
import ToggleItem from './ToggleItem'

export default function SignupScreen() {
  const [tosAgreed, setTosAgreed] = useState(false)
  const [ageAgreed, setAgeAgreed] = useState(false)
  const username = useHookstate('')
  const email = useHookstate('')
  const isValid = useHookstate(false)

  const { pending, handleMagicLink, sent } = useMagicLink()

  const onMagicLinkClick = async () => {
    sent.set(true)
    await handleMagicLink(email.value, true, username.value)
    NotificationService.dispatchNotify('Check your email for a magic link', { variant: 'success' })
  }

  useEffect(() => {
    isValid.set(validateEmail(email.value))
  }, [email.value])

  const agreedToAll = tosAgreed && ageAgreed
  const oauthConnectedState = useOAuthState()
  const authSettings = useAuthSettings()

  const handleProviderClick = (client: string) => {
    AuthService.loginUserByOAuth(client, location, true, location.href, username.value)
  }

  const clientSetting = useEngineSetting<ClientEngineSettingType>('client')

  const disconnectedProviders = Socials.filter((p) => !oauthConnectedState[p.client].value && authSettings[p.client])

  const disableMagicLink = !agreedToAll || pending.value || sent.value || !isValid.value

  return (
    <Inner className="flex min-h-full flex-col gap-4">
      <div className="font-dm-sans">By signing up, you agree to the following:</div>
      <Section className="font-figtree">
        <ToggleItem checked={tosAgreed} onClick={() => setTosAgreed(!tosAgreed)}>
          <span>
            I agree to the{' '}
            <Link target="_blank" href={clientSetting?.data?.termsOfService ?? ''}>
              Infinite Reality Terms of Service
            </Link>
          </span>
        </ToggleItem>
        <ToggleItem
          checked={ageAgreed}
          onClick={() => setAgeAgreed(!ageAgreed)}
          label="I am 18 years of age or older"
        />
      </Section>
      <Section disabled={!agreedToAll}>
        <FieldItem type="text" label="Username" placeholder="Username" onChange={username.set} value={username.value} />
      </Section>

      <div className="mt-2">
        <Section disabled={!agreedToAll}>
          <FieldItem type="email" label="Email" onChange={email.set} value={email.value} />
        </Section>

        <TextButton
          disabled={disableMagicLink}
          onClick={onMagicLinkClick}
          className={`text-md mx-auto mt-4 flex w-full justify-center gap-2`}
        >
          {sent.value ? 'Sent!' : 'Send magic link'}
          <FaLink />
        </TextButton>
      </div>

      <div className={`mt-4 ${agreedToAll ? '' : 'opacity-50'}`}>Or Connect to:</div>
      <Section className={agreedToAll ? '' : 'pointer-events-none cursor-not-allowed opacity-50'}>
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
    </Inner>
  )
}
