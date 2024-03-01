import { UserType } from '@etherealengine/common/src/schema.type.module'
import React from 'react'
import { MdEmail } from 'react-icons/md'
import {
  RiDiscordFill,
  RiFacebookBoxFill,
  RiGithubFill,
  RiGoogleFill,
  RiMessage2Line,
  RiTwitterFill
} from 'react-icons/ri'

export default function AccountIdentifiers({ user }: { user: UserType }) {
  const discordIp = user.identityProviders.find((ip) => ip.type === 'discord')
  const googleIp = user.identityProviders.find((ip) => ip.type === 'google')
  const facebookIp = user.identityProviders.find((ip) => ip.type === 'facebook')
  const twitterIp = user.identityProviders.find((ip) => ip.type === 'twitter')
  const linkedinIp = user.identityProviders.find((ip) => ip.type === 'linkedin')
  const githubIp = user.identityProviders.find((ip) => ip.type === 'github')
  const emailIp = user.identityProviders.find((ip) => ip.type === 'email')
  const smsIp = user.identityProviders.find((ip) => ip.type === 'sms')

  return (
    <div className="flex items-center gap-2">
      {discordIp ? <RiDiscordFill className="h-6 w-6" /> : null}
      {googleIp ? <RiGoogleFill className="h-6 w-6" /> : null}
      {facebookIp ? <RiFacebookBoxFill className="h-6 w-6" /> : null}
      {twitterIp ? <RiTwitterFill className="h-6 w-6" /> : null}
      {linkedinIp ? <RiTwitterFill className="h-6 w-6" /> : null}
      {githubIp ? <RiGithubFill className="h-6 w-6" /> : null}
      {smsIp ? <RiMessage2Line className="h-6 w-6" /> : null}
      {emailIp ? <MdEmail className="h-6 w-6" /> : null}
    </div>
  )
}
