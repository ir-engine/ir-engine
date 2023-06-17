/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { AuthStrategies } from './AuthStrategies'

export interface AdminAuthSetting {
  id: string
  service: string
  entity: string
  secret: string
  authStrategies: AuthStrategies[]
  jwtOptions: JwtOptions
  bearerToken: BearerToken
  callback: Callback
  oauth: Oauth
  createdAt: string
  updatedAt: string
}

interface JwtOptions {
  expiresIn: string
}

interface BearerToken {
  numBytes: number
}

interface Callback {
  facebook: string
  github: string
  google: string
  linkedin: string
  twitter: string
  discord: string
}

interface Oauth {
  defaults: Defaults
  facebook: Facebook
  github: Github
  google: Google
  linkedin: Linkedin
  twitter: Twitter
  discord: Discord
}

interface Defaults {
  host: string
  protocol: string
}
interface Discord {
  key: string
  secret: string
}

interface Facebook {
  key: string
  secret: string
}

interface Github {
  appid: string
  key: string
  secret: string
}

interface Google {
  key: string
  secret: string
  scope: string[]
}

interface Linkedin {
  key: string
  secret: string
  scope: string[]
}

interface Twitter {
  key: string
  secret: string
}

export interface PatchAuthSetting {
  authStrategies: string
  oauth: string
}
