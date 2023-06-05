// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

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

export const awsS3Schema = Type.Object(
  {
    endpoint: Type.String(),
    staticResourceBucket: Type.String(),
    region: Type.String(),
    avatarDir: Type.String(),
    s3DevMode: Type.String()
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
    keys: Type.Ref(awsKeysSchema),
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

export type AwsSettingDatabaseType = Omit<AwsSettingType, 'keys' | 'route53' | 's3' | 'cloudfront' | 'sms'> & {
  keys: string
  route53: string
  s3: string
  cloudfront: string
  sms: string
}

// Schema for creating new entries
export const awsSettingDataSchema = Type.Pick(awsSettingSchema, ['keys', 'route53', 's3', 'cloudfront', 'sms'], {
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
