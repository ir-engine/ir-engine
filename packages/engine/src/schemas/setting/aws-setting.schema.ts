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
import type { Static } from '@feathersjs/typebox'
import { querySyntax, Type } from '@feathersjs/typebox'

export const awsSettingPath = 'aws-setting'

export const awsSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const awsKeysSchema = Type.Object(
  {
    accessKeyId: Type.String(),
    secretAccessKey: Type.String()
  },
  { $id: 'AwsKeys', additionalProperties: false }
)
export type AwsKeysType = Static<typeof awsKeysSchema>

export const awsRoute53Schema = Type.Object(
  {
    hostedZoneId: Type.String(),
    keys: Type.Ref(awsKeysSchema)
  },
  { $id: 'AwsRoute53', additionalProperties: false }
)
export type AwsRoute53Type = Static<typeof awsRoute53Schema>

export const awsEksSchema = Type.Object(
  {
    accessKeyId: Type.String(),
    secretAccessKey: Type.String()
  },
  { $id: 'AwsEks', additionalProperties: false }
)
export type AwsEksType = Static<typeof awsEksSchema>

export const awsS3Schema = Type.Object(
  {
    accessKeyId: Type.String(),
    endpoint: Type.String(),
    staticResourceBucket: Type.String(),
    region: Type.String(),
    avatarDir: Type.String(),
    s3DevMode: Type.String(),
    secretAccessKey: Type.String()
  },
  { $id: 'AwsS3', additionalProperties: false }
)
export type AwsS3Type = Static<typeof awsS3Schema>

export const awsCloudFrontSchema = Type.Object(
  {
    domain: Type.String(),
    distributionId: Type.String(),
    region: Type.String()
  },
  { $id: 'AwsCloudFront', additionalProperties: false }
)
export type AwsCloudFrontType = Static<typeof awsCloudFrontSchema>

export const awsSmsSchema = Type.Object(
  {
    accessKeyId: Type.String(),
    applicationId: Type.String(),
    region: Type.String(),
    senderId: Type.String(),
    secretAccessKey: Type.String()
  },
  { $id: 'AwsSms', additionalProperties: false }
)
export type AwsSmsType = Static<typeof awsSmsSchema>

// Main data model schema
export const awsSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    eks: Type.Ref(awsEksSchema),
    route53: Type.Ref(awsRoute53Schema),
    s3: Type.Ref(awsS3Schema),
    cloudfront: Type.Ref(awsCloudFrontSchema),
    sms: Type.Ref(awsSmsSchema),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'AwsSetting', additionalProperties: false }
)
export type AwsSettingType = Static<typeof awsSettingSchema>

export type AwsSettingDatabaseType = Omit<AwsSettingType, 'eks' | 'route53' | 's3' | 'cloudfront' | 'sms'> & {
  eks: string
  route53: string
  s3: string
  cloudfront: string
  sms: string
}

// Schema for creating new entries
export const awsSettingDataSchema = Type.Pick(awsSettingSchema, ['eks', 'route53', 's3', 'cloudfront', 'sms'], {
  $id: 'AwsSettingData'
})
export type AwsSettingData = Static<typeof awsSettingDataSchema>

// Schema for updating existing entries
export const awsSettingPatchSchema = Type.Partial(awsSettingSchema, {
  $id: 'AwsSettingPatch'
})
export type AwsSettingPatch = Static<typeof awsSettingPatchSchema>

// Schema for allowed query properties
export const awsSettingQueryProperties = Type.Pick(awsSettingSchema, [
  'id'
  // 'keys', Commented out because: https://discord.com/channels/509848480760725514/1093914405546229840/1095101536121667694
  // 'route53',
  // 's3',
  // 'cloudfront',
  // 'sms'
])
export const awsSettingQuerySchema = Type.Intersect(
  [
    querySyntax(awsSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type AwsSettingQuery = Static<typeof awsSettingQuerySchema>
