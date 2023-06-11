// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const serverSettingPath = 'server-setting'

export const serverSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const serverHubSchema = Type.Object(
  {
    endpoint: Type.String()
  },
  { $id: 'ServerHub', additionalProperties: false }
)
export type ServerHubType = Static<typeof serverHubSchema>

// Main data model schema
export const serverSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    hostname: Type.String(),
    mode: Type.String(),
    port: Type.String(),
    clientHost: Type.String(),
    rootDir: Type.String(),
    publicDir: Type.String(),
    nodeModulesDir: Type.String(),
    localStorageProvider: Type.String(),
    performDryRun: Type.Boolean(),
    storageProvider: Type.String(),
    gaTrackingId: Type.String(),
    hub: Type.Ref(serverHubSchema),
    url: Type.String(),
    certPath: Type.String(),
    keyPath: Type.String(),
    gitPem: Type.String(),
    local: Type.Boolean(),
    releaseName: Type.String(),
    instanceserverUnreachableTimeoutSeconds: Type.Integer(),
    githubWebhookSecret: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ServerSetting', additionalProperties: false }
)
export type ServerSettingType = Static<typeof serverSettingSchema>

export type ServerSettingDatabaseType = Omit<ServerSettingType, 'hub'> & { hub: string }

// Schema for creating new entries
export const serverSettingDataSchema = Type.Pick(
  serverSettingSchema,
  [
    'hostname',
    'mode',
    'port',
    'clientHost',
    'rootDir',
    'publicDir',
    'nodeModulesDir',
    'localStorageProvider',
    'performDryRun',
    'storageProvider',
    'gaTrackingId',
    'hub',
    'url',
    'certPath',
    'keyPath',
    'gitPem',
    'local',
    'releaseName',
    'instanceserverUnreachableTimeoutSeconds',
    'githubWebhookSecret'
  ],
  {
    $id: 'ServerSettingData'
  }
)
export type ServerSettingData = Static<typeof serverSettingDataSchema>

// Schema for updating existing entries
export const serverSettingPatchSchema = Type.Partial(serverSettingSchema, {
  $id: 'ServerSettingPatch'
})
export type ServerSettingPatch = Static<typeof serverSettingPatchSchema>

// Schema for allowed query properties
export const serverSettingQueryProperties = Type.Pick(serverSettingSchema, [
  'id',
  'hostname',
  'mode',
  'port',
  'clientHost',
  'rootDir',
  'publicDir',
  'nodeModulesDir',
  'localStorageProvider',
  'performDryRun',
  'storageProvider',
  'gaTrackingId',
  // 'hub', Commented out because: https://discord.com/channels/509848480760725514/1093914405546229840/1095101536121667694
  'url',
  'certPath',
  'keyPath',
  'gitPem',
  'local',
  'releaseName',
  'instanceserverUnreachableTimeoutSeconds',
  'githubWebhookSecret'
])
export const serverSettingQuerySchema = Type.Intersect(
  [
    querySyntax(serverSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ServerSettingQuery = Static<typeof serverSettingQuerySchema>
