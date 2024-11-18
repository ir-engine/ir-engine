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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { MdEmail } from 'react-icons/md'
import {
  RiAppleFill,
  RiDiscordFill,
  RiGithubFill,
  RiGoogleFill,
  RiLinkedinFill,
  RiMessage2Line,
  RiMetaFill,
  RiTwitterXFill
} from 'react-icons/ri'

import { useFind } from '@ir-engine/common'
import { identityProviderPath, IdentityProviderType, UserType } from '@ir-engine/common/src/schema.type.module'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import Tooltip from '@ir-engine/ui/src/primitives/tailwind/Tooltip'

export default function AccountIdentifiers({ user }: { user: UserType }) {
  const identityProvidersQuery = useFind(identityProviderPath, { query: { userId: user.id, action: 'admin' } })

  const appleIp = identityProvidersQuery.data.find((ip) => ip.type === 'apple')
  const discordIp = identityProvidersQuery.data.find((ip) => ip.type === 'discord')
  const googleIp = identityProvidersQuery.data.find((ip) => ip.type === 'google')
  const facebookIp = identityProvidersQuery.data.find((ip) => ip.type === 'facebook')
  const twitterIp = identityProvidersQuery.data.find((ip) => ip.type === 'twitter')
  const linkedinIp = identityProvidersQuery.data.find((ip) => ip.type === 'linkedin')
  const githubIp = identityProvidersQuery.data.find((ip) => ip.type === 'github')
  const emailIp = identityProvidersQuery.data.find((ip) => ip.type === 'email')
  const smsIp = identityProvidersQuery.data.find((ip) => ip.type === 'sms')

  const getAccountIdentifierTitle = (ip: IdentityProviderType) => {
    return (
      <div className="flex flex-col justify-center">
        <Text className="text-center">{ip.accountIdentifier!}</Text>
        {ip.email && <Text>{`(${ip.email})`}</Text>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {appleIp ? (
        <Tooltip content={getAccountIdentifierTitle(appleIp)}>
          <RiAppleFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {discordIp ? (
        <Tooltip content={getAccountIdentifierTitle(discordIp)}>
          <RiDiscordFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {googleIp ? (
        <Tooltip content={getAccountIdentifierTitle(googleIp)}>
          <RiGoogleFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {facebookIp ? (
        <Tooltip content={getAccountIdentifierTitle(facebookIp)}>
          <RiMetaFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {twitterIp ? (
        <Tooltip content={getAccountIdentifierTitle(twitterIp)}>
          <RiTwitterXFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {linkedinIp ? (
        <Tooltip content={getAccountIdentifierTitle(linkedinIp)}>
          <RiLinkedinFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {githubIp ? (
        <Tooltip content={getAccountIdentifierTitle(githubIp)}>
          <RiGithubFill className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {smsIp ? (
        <Tooltip content={getAccountIdentifierTitle(smsIp)}>
          <RiMessage2Line className="h-6 w-6" />
        </Tooltip>
      ) : null}
      {emailIp ? (
        <Tooltip content={getAccountIdentifierTitle(emailIp)}>
          <MdEmail className="h-6 w-6" />
        </Tooltip>
      ) : null}
    </div>
  )
}
