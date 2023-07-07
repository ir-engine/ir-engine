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

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const authenticationPath = 'authentication'

export const authenticationMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const authStrategiesSchema = Type.Object(
  {
    jwt: Type.Boolean(),
    facebook: Type.Boolean(),
    github: Type.Boolean(),
    google: Type.Boolean(),
    linkedin: Type.Boolean(),
    twitter: Type.Boolean(),
    emailMagicLink: Type.Boolean(),
    smsMagicLink: Type.Boolean(),
    didWallet: Type.Boolean()
  },
  { $id: 'AuthStrategies', additionalProperties: false }
)
export type AuthStrategiesType = Static<typeof authStrategiesSchema>

export const jwtOptionsSchema = Type.Object(
  {
    expiresIn: Type.String()
  },
  { $id: 'JwtOptions', additionalProperties: false }
)
export type JwtOptionsType = Static<typeof jwtOptionsSchema>

export const bearerTokenSchema = Type.Object(
  {
    numBytes: Type.Number()
  },
  { $id: 'BearerToken', additionalProperties: false }
)
export type BearerTokenType = Static<typeof bearerTokenSchema>

export const callbackSchema = Type.Object(
  {
    facebook: Type.String(),
    github: Type.String(),
    google: Type.String(),
    linkedin: Type.String(),
    twitter: Type.String(),
    discord: Type.String()
  },
  { $id: 'Callback', additionalProperties: false }
)
export type CallbackType = Static<typeof callbackSchema>

export const defaultsSchema = Type.Object(
  {
    host: Type.String(),
    protocol: Type.String()
  },
  { $id: 'Defaults', additionalProperties: false }
)
export type DefaultsType = Static<typeof defaultsSchema>

export const discordSchema = Type.Object(
  {
    key: Type.String(),
    secret: Type.String()
  },
  { $id: 'Discord', additionalProperties: false }
)
export type DiscordType = Static<typeof discordSchema>

export const facebookSchema = Type.Object(
  {
    key: Type.String(),
    secret: Type.String()
  },
  { $id: 'Facebook', additionalProperties: false }
)
export type FacebookType = Static<typeof facebookSchema>

export const githubSchema = Type.Object(
  {
    appid: Type.String(),
    key: Type.String(),
    secret: Type.String()
  },
  { $id: 'Github', additionalProperties: false }
)
export type GithubType = Static<typeof githubSchema>

export const googleSchema = Type.Object(
  {
    key: Type.String(),
    secret: Type.String(),
    scope: Type.Array(Type.String())
  },
  { $id: 'Google', additionalProperties: false }
)
export type GoogleType = Static<typeof googleSchema>

export const linkedinSchema = Type.Object(
  {
    key: Type.String(),
    secret: Type.String(),
    scope: Type.Array(Type.String())
  },
  { $id: 'Linkedin', additionalProperties: false }
)
export type LinkedinType = Static<typeof linkedinSchema>

export const twitterSchema = Type.Object(
  {
    key: Type.String(),
    secret: Type.String()
  },
  { $id: 'Twitter', additionalProperties: false }
)
export type TwitterType = Static<typeof twitterSchema>

export const oauthSchema = Type.Object(
  {
    defaults: Type.Ref(defaultsSchema),
    facebook: Type.Ref(facebookSchema),
    github: Type.Ref(githubSchema),
    google: Type.Ref(googleSchema),
    linkedin: Type.Ref(linkedinSchema),
    twitter: Type.Ref(twitterSchema),
    discord: Type.Ref(discordSchema)
  },
  { $id: 'Oauth', additionalProperties: false }
)
export type OauthType = Static<typeof oauthSchema>

// Main data model schema
export const authenticationSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    service: Type.String(),
    entity: Type.String(),
    secret: Type.String(),
    authStrategies: Type.Array(Type.Ref(authStrategiesSchema)),
    jwtOptions: Type.Ref(jwtOptionsSchema),
    bearerToken: Type.Ref(bearerTokenSchema),
    callback: Type.Ref(callbackSchema),
    oauth: Type.Ref(oauthSchema),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Authentication', additionalProperties: false }
)
export type AuthenticationType = Static<typeof authenticationSchema>

export type AuthenticationDatabaseType = Omit<
  AuthenticationType,
  'authStrategies' | 'jwtOptions' | 'bearerToken' | 'callback' | 'oauth'
> & {
  authStrategies: string
  jwtOptions: string
  bearerToken: string
  callback: string
  oauth: string
}

// Schema for creating new entries
export const authenticationDataSchema = Type.Pick(
  authenticationSchema,
  ['service', 'entity', 'secret', 'authStrategies', 'jwtOptions', 'bearerToken', 'callback', 'oauth'],
  {
    $id: 'AuthenticationData'
  }
)
export type AuthenticationData = Static<typeof authenticationDataSchema>

// Schema for updating existing entries
export const authenticationPatchSchema = Type.Partial(authenticationSchema, {
  $id: 'AuthenticationPatch'
})
export type AuthenticationPatch = Static<typeof authenticationPatchSchema>

// Schema for allowed query properties
export const authenticationQueryProperties = Type.Pick(authenticationSchema, ['id'])
export const authenticationQuerySchema = Type.Intersect(
  [
    querySyntax(authenticationQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type AuthenticationQuery = Static<typeof authenticationQuerySchema>
