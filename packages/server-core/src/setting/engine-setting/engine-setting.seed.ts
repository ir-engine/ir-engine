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

import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { defaultMediaSettings } from '@ir-engine/common/src/constants/DefaultMediaSettings'
import { defaultWebRTCSettings } from '@ir-engine/common/src/constants/DefaultWebRTCSettings'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { identityProviderPath } from '@ir-engine/common/src/schema.type.module'
import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { flattenObjectToArray } from '@ir-engine/common/src/utils/jsonHelperUtils'
import appConfig from '@ir-engine/server-core/src/appconfig'
import appRootPath from 'app-root-path'
import config from '../../appconfig'

export const DISCORD_SCOPES = ['email', 'identify']
export const GITHUB_SCOPES = ['repo', 'user', 'workflow']
export const GOOGLE_SCOPES = ['profile', 'email']
export const LINKEDIN_SCOPES = ['openid', 'profile', 'email']
export const APPLE_SCOPES = ['openid', 'email', 'name']

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const taskServerSeedData = await generateSeedData(
    [
      { key: EngineSettings.TaskServer.Port, value: process.env.TASKSERVER_PORT || '3030' },
      { key: EngineSettings.TaskServer.ProcessInterval, value: process.env.TASKSERVER_PROCESS_INTERVAL_SECONDS || '30' }
    ],
    'task-server'
  )

  const chargebeeSettingSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.Chargebee.Url,
        value: process.env.CHARGEBEE_SITE + '.chargebee.com' || 'dummy.not-chargebee.com'
      },
      { key: EngineSettings.Chargebee.ApiKey, value: process.env.CHARGEBEE_API_KEY || '' }
    ],
    'chargebee'
  )
  const zendeskSettingSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.Zendesk.Name,
        value: process.env.ZENDESK_KEY_NAME || ''
      },
      {
        key: EngineSettings.Zendesk.Secret,
        value: process.env.ZENDESK_SECRET || ''
      },
      {
        key: EngineSettings.Zendesk.Kid,
        value: process.env.ZENDESK_KID || ''
      }
    ],
    'zendesk'
  )

  const coilSeedData = await generateSeedData(
    [
      { key: EngineSettings.Coil.PaymentPointer, value: process.env.COIL_PAYMENT_POINTER || '' },
      { key: EngineSettings.Coil.ClientId, value: process.env.COIL_API_CLIENT_ID || '' },
      { key: EngineSettings.Coil.ClientSecret, value: process.env.COIL_API_CLIENT_SECRET || '' }
    ],
    'coil'
  )
  const instanceServerSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.InstanceServer.ClientHost,
        value: process.env.APP_HOST || ''
      },
      {
        key: EngineSettings.InstanceServer.RtcStartPort,
        value: process.env.RTC_START_PORT || ''
      },
      {
        key: EngineSettings.InstanceServer.RtcEndPort,
        value: process.env.RTC_END_PORT || ''
      },
      {
        key: EngineSettings.InstanceServer.RtcPortBlockSize,
        value: process.env.RTC_PORT_BLOCK_SIZE || ''
      },
      {
        key: EngineSettings.InstanceServer.IdentifierDigits,
        value: '5'
      },
      {
        key: EngineSettings.InstanceServer.Local,
        value: `${process.env.LOCAL === 'true'}`
      },
      {
        key: EngineSettings.InstanceServer.Domain,
        value: process.env.INSTANCESERVER_DOMAIN || 'instanceserver.etherealengine.com'
      },
      {
        key: EngineSettings.InstanceServer.ReleaseName,
        value: process.env.RELEASE_NAME || 'local'
      },
      {
        key: EngineSettings.InstanceServer.Port,
        value: process.env.INSTANCESERVER_PORT || '3031'
      },
      {
        key: EngineSettings.InstanceServer.Mode,
        value: process.env.INSTANCESERVER_MODE || 'dev'
      },
      {
        key: EngineSettings.InstanceServer.LocationName,
        value: process.env.PRELOAD_LOCATION_NAME || ''
      },
      {
        key: EngineSettings.InstanceServer.ShutdownDelayMs,
        value: process.env.INSTANCESERVER_SHUTDOWN_DELAY_MS || '0'
      }
    ],
    'instance-server'
  )

  const instanceServerWebRtc: EngineSettingType[] = await Promise.all(
    flattenObjectToArray(defaultWebRTCSettings).map(async ({ key, value }) => ({
      id: uuidv4(),
      key,
      value,
      dataType: getDataType(`${value}`),
      jsonKey: EngineSettings.InstanceServer.WebRTCSettings,
      type: 'private' as EngineSettingType['type'],
      category: 'instance-server-webrtc',
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )
  const metabaseSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.Metabase.SiteUrl,
        value: process.env.METABASE_SITE_URL || ''
      },
      {
        key: EngineSettings.Metabase.SecretKey,
        value: process.env.METABASE_SECRET_KEY || ''
      },
      {
        key: EngineSettings.Metabase.Expiration,
        value: process.env.METABASE_EXPIRATION || ''
      },
      {
        key: EngineSettings.Metabase.CrashDashboardId,
        value: process.env.METABASE_CRASH_DASHBOARD_ID || ''
      },
      {
        key: EngineSettings.Metabase.Environment,
        value: process.env.METABASE_ENVIRONMENT || ''
      }
    ],
    'metabase'
  )

  const redisSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.Redis.Address,
        value: process.env.REDIS_ADDRESS || 'localhost'
      },
      {
        key: EngineSettings.Redis.Password,
        value: process.env.REDIS_PASSWORD || ''
      },
      {
        key: EngineSettings.Redis.Port,
        value: process.env.REDIS_PORT || '6379'
      },
      {
        key: EngineSettings.Redis.Enabled,
        value: process.env.REDIS_ENABLED || ''
      }
    ],
    'redis'
  )

  const helmSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.Helm.Main,
        value: ''
      },
      {
        key: EngineSettings.Helm.Builder,
        value: ''
      }
    ],
    'helm'
  )

  const serverSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.Server.Port,
        value: process.env.SERVER_PORT || '3030'
      },
      {
        key: EngineSettings.Server.Hostname,
        value: process.env.SERVER_HOSTNAME || 'localhost'
      },
      {
        key: EngineSettings.Server.Mode,
        value: process.env.NODE_ENV || 'development'
      },
      {
        key: EngineSettings.Server.ClientHost,
        value: process.env.CLIENT_HOST || 'localhost'
      },
      {
        key: EngineSettings.Server.RootDirectory,
        value: process.env.ROOT_DIR || ''
      },
      {
        key: EngineSettings.Server.PublicDirectory,
        value: process.env.PUBLIC_DIR || ''
      },
      {
        key: EngineSettings.Server.NodeModulesDirectory,
        value: process.env.NODE_MODULES_DIR || ''
      },
      {
        key: EngineSettings.Server.LocalStorageProvider,
        value: process.env.LOCAL_STORAGE_PROVIDER || ''
      },
      {
        key: EngineSettings.Server.PerformDryRun,
        value: process.env.PERFORM_DRY_RUN || 'false'
      },
      {
        key: EngineSettings.Server.StorageProvider,
        value: process.env.STORAGE_PROVIDER || ''
      },
      {
        key: EngineSettings.Server.Hub.Endpoint,
        value: process.env.HUB_ENDPOINT || ''
      },
      {
        key: EngineSettings.Server.Url,
        value: process.env.SERVER_URL || ''
      },
      {
        key: EngineSettings.Server.Local,
        value: process.env.LOCAL || 'false'
      },
      {
        key: EngineSettings.Server.CertPath,
        value: appRootPath.path.toString() + '/' + process.env.CERT || ''
      },
      {
        key: EngineSettings.Server.KeyPath,
        value: appRootPath.path.toString() + '/' + process.env.KEY || ''
      }
    ],
    'server'
  )

  const awsSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.Aws.S3.AccessKeyId,
        value: process.env.STORAGE_AWS_ACCESS_KEY_ID || ''
      },
      {
        key: EngineSettings.Aws.S3.AvatarDir,
        value: process.env.STORAGE_S3_AVATAR_DIRECTORY || ''
      },
      {
        key: EngineSettings.Aws.S3.Endpoint,
        value: process.env.STORAGE_S3_ENDPOINT || ''
      },
      {
        key: EngineSettings.Aws.S3.Region,
        value: process.env.STORAGE_REGION || ''
      },
      {
        key: EngineSettings.Aws.S3.RoleArn,
        value: process.env.STORAGE_AWS_ROLE_ARN || ''
      },
      {
        key: EngineSettings.Aws.S3.SecretAccessKey,
        value: process.env.STORAGE_AWS_ACCESS_KEY_SECRET || ''
      },
      {
        key: EngineSettings.Aws.S3.S3DevMode,
        value: process.env.STORAGE_S3_DEV_MODE || ''
      },
      {
        key: EngineSettings.Aws.S3.StaticResourceBucket,
        value: process.env.STORAGE_STATIC_RESOURCE_BUCKET || ''
      },
      {
        key: EngineSettings.Aws.CloudFront.DistributionId,
        value: process.env.STORAGE_CLOUDFRONT_DISTRIBUTION_ID || ''
      },
      {
        key: EngineSettings.Aws.CloudFront.Domain,
        value:
          process.env.SERVE_CLIENT_FROM_STORAGE_PROVIDER === 'true'
            ? process.env.APP_HOST!
            : process.env.STORAGE_CDN_DOMAIN! || ''
      },
      {
        key: EngineSettings.Aws.CloudFront.Region,
        value: process.env.STORAGE_CLOUDFRONT_REGION || process.env.STORAGE_REGION || ''
      },
      {
        key: EngineSettings.Aws.SMS.AccessKeyId,
        value: process.env.AWS_SMS_ACCESS_KEY_ID || ''
      },
      {
        key: EngineSettings.Aws.SMS.SecretAccessKey,
        value: process.env.AWS_SMS_SECRET_ACCESS_KEY || ''
      },
      {
        key: EngineSettings.Aws.SMS.ApplicationId,
        value: process.env.AWS_SMS_APPLICATION_ID || ''
      },
      {
        key: EngineSettings.Aws.SMS.Region,
        value: process.env.AWS_SMS_REGION || ''
      },
      {
        key: EngineSettings.Aws.SMS.SenderId,
        value: process.env.AWS_SMS_SENDER_ID || ''
      },
      {
        key: EngineSettings.Aws.EKS.AccessKeyId,
        value: process.env.EKS_AWS_ACCESS_KEY_SECRET || ''
      },
      {
        key: EngineSettings.Aws.EKS.RoleArn,
        value: process.env.AWS_EKS_ROLE_ARN || ''
      },
      {
        key: EngineSettings.Aws.EKS.SecretAccessKey,
        value: process.env.EKS_AWS_ACCESS_KEY_ID || ''
      }
    ],
    'aws'
  )

  const emailSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.EmailSetting.From,
        value: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`
      },
      {
        key: EngineSettings.EmailSetting.Smtp.Host,
        value: process.env.SMTP_HOST || 'test'
      },
      {
        key: EngineSettings.EmailSetting.Smtp.Port,
        value: process.env.SMTP_PORT || ''
      },
      {
        key: EngineSettings.EmailSetting.Smtp.Secure,
        value: process.env.SMTP_SECURE || 'true'
      },
      {
        key: EngineSettings.EmailSetting.Smtp.Auth.User,
        value: process.env.SMTP_USER || 'test'
      },
      {
        key: EngineSettings.EmailSetting.Smtp.Auth.Pass,
        value: process.env.SMTP_PASS || 'test'
      },
      {
        key: EngineSettings.EmailSetting.SmsNameCharacterLimit,
        value: process.env.SMTP_SUBJECT_SMS_NAME_CHARACTER_LIMIT || '20'
      },
      {
        key: EngineSettings.EmailSetting.Subject.NewUser,
        value: process.env.SMTP_SUBJECT_NEW_USER || 'Infinite Reality Engine signup'
      },
      {
        key: EngineSettings.EmailSetting.Subject.Channel,
        value: process.env.SMTP_SUBJECT_CHANNEL || 'Infinite Reality Engine channel invitation'
      },
      {
        key: EngineSettings.EmailSetting.Subject.Friend,
        value: process.env.SMTP_SUBJECT_FRIEND || 'Infinite Reality Engine friend request'
      },
      {
        key: EngineSettings.EmailSetting.Subject.Instance,
        value: process.env.SMTP_SUBJECT_INSTANCE || 'Infinite Reality Engine location link'
      },
      {
        key: EngineSettings.EmailSetting.Subject.Location,
        value: process.env.SMTP_SUBJECT_LOCATION || 'Infinite Reality Engine location link'
      },
      {
        key: EngineSettings.EmailSetting.Subject.Login,
        value: process.env.SMTP_SUBJECT_LOGIN || 'Infinite Reality Engine login link'
      }
    ],
    'email'
  )

  const authSeedData = (
    await generateSeedData(
      [
        {
          key: EngineSettings.Authentication.service,
          value: identityProviderPath
        },
        {
          key: EngineSettings.Authentication.entity,
          value: identityProviderPath
        },
        {
          key: EngineSettings.Authentication.secret,
          value: process.env.AUTH_SECRET || 'test'
        },
        {
          key: EngineSettings.Authentication.JwtAlgorithm,
          value: process.env.JWT_ALGORITHM || ''
        },
        {
          key: EngineSettings.Authentication.JwtPublicKey,
          value: process.env.JWT_PUBLIC_KEY || ''
        },
        {
          key: EngineSettings.Authentication.AuthStrategies.Jwt,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.AuthStrategies.Apple,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.AuthStrategies.Discord,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.AuthStrategies.Facebook,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.AuthStrategies.Github,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.AuthStrategies.Google,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.AuthStrategies.Linkedin,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.AuthStrategies.Twitter,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.AuthStrategies.SmsMagicLink,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.AuthStrategies.EmailMagicLink,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.AuthStrategies.DidWallet,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.JwtOptions.Algorithm,
          value: process.env.JWT_ALGORITHM || 'HS256'
        },
        {
          key: EngineSettings.Authentication.JwtOptions.ExpiresIn,
          value: '30 days'
        },
        {
          key: EngineSettings.Authentication.BearerToken.NumBytes,
          value: '16'
        },
        {
          key: EngineSettings.Authentication.Callback.Apple,
          value: process.env.APPLE_CALLBACK_URL || `${appConfig.client.url}/auth/oauth/apple`
        },
        {
          key: EngineSettings.Authentication.Callback.Discord,
          value: process.env.DISCORD_CALLBACK_URL || `${appConfig.client.url}/auth/oauth/discord`
        },
        {
          key: EngineSettings.Authentication.Callback.Facebook,
          value: process.env.FACEBOOK_CALLBACK_URL || `${appConfig.client.url}/auth/oauth/facebook`
        },
        {
          key: EngineSettings.Authentication.Callback.Github,
          value: process.env.GITHUB_CALLBACK_URL || `${appConfig.client.url}/auth/oauth/github`
        },
        {
          key: EngineSettings.Authentication.Callback.Google,
          value: process.env.GOOGLE_CALLBACK_URL || `${appConfig.client.url}/auth/oauth/google`
        },
        {
          key: EngineSettings.Authentication.Callback.Linkedin,
          value: process.env.LINKEDIN_CALLBACK_URL || `${appConfig.client.url}/auth/oauth/linkedin`
        },
        {
          key: EngineSettings.Authentication.Callback.Twitter,
          value: process.env.TWITTER_CALLBACK_URL || `${appConfig.client.url}/auth/oauth/twitter`
        },
        {
          key: EngineSettings.Authentication.Oauth.Default.Host,
          value:
            config.server.hostname !== '127.0.0.1' && config.server.hostname !== 'localhost'
              ? config.server.hostname
              : config.server.hostname + ':' + config.server.port
        },
        {
          key: EngineSettings.Authentication.Oauth.Default.Protocol,
          value: 'https'
        },
        {
          key: EngineSettings.Authentication.Oauth.Apple.Key,
          value: process.env.APPLE_CLIENT_ID || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Apple.Secret,
          value: process.env.APPLE_CLIENT_SECRET || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Apple.Scope.OpenId,
          value: 'openid'
        },
        {
          key: EngineSettings.Authentication.Oauth.Apple.Scope.Email,
          value: 'email'
        },
        {
          key: EngineSettings.Authentication.Oauth.Apple.Scope.Name,
          value: 'name'
        },
        {
          key: EngineSettings.Authentication.Oauth.Apple.Response.Raw,
          value: 'raw'
        },
        {
          key: EngineSettings.Authentication.Oauth.Apple.Response.Jwt,
          value: 'jwt'
        },
        {
          key: EngineSettings.Authentication.Oauth.Apple.CustomParams.ResponseMode,
          value: 'form_post'
        },
        {
          key: EngineSettings.Authentication.Oauth.Apple.CustomParams.ResponseType,
          value: 'code id_token'
        },
        {
          key: EngineSettings.Authentication.Oauth.Apple.Nonce,
          value: 'true'
        },
        {
          key: EngineSettings.Authentication.Oauth.Discord.Key,
          value: process.env.DISCORD_CLIENT_ID || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Discord.Secret,
          value: process.env.DISCORD_CLIENT_SECRET || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Discord.Scope.Email,
          value: 'email'
        },
        {
          key: EngineSettings.Authentication.Oauth.Discord.Scope.Identify,
          value: 'identify'
        },
        {
          key: EngineSettings.Authentication.Oauth.Discord.CustomParams.Prompt,
          value: 'none'
        },
        {
          key: EngineSettings.Authentication.Oauth.Facebook.Key,
          value: process.env.FACEBOOK_CLIENT_ID || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Facebook.Secret,
          value: process.env.FACEBOOK_CLIENT_SECRET || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Github.AppId,
          value: process.env.GITHUB_APP_ID || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Github.Key,
          value: process.env.GITHUB_CLIENT_ID || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Github.Secret,
          value: process.env.GITHUB_CLIENT_SECRET || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Github.PrivateKey,
          value: process.env.GITHUB_PRIVATE_KEY || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Github.Scope.Repo,
          value: 'repo'
        },
        {
          key: EngineSettings.Authentication.Oauth.Github.Scope.User,
          value: 'user'
        },
        {
          key: EngineSettings.Authentication.Oauth.Github.Scope.Workflow,
          value: 'workflow'
        },
        {
          key: EngineSettings.Authentication.Oauth.Google.Key,
          value: process.env.GOOGLE_CLIENT_ID || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Google.Secret,
          value: process.env.GOOGLE_CLIENT_SECRET || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Google.Scope.Profile,
          value: 'profile'
        },
        {
          key: EngineSettings.Authentication.Oauth.Google.Scope.Email,
          value: 'email'
        },
        {
          key: EngineSettings.Authentication.Oauth.Linkedin.Key,
          value: process.env.LINKEDIN_CLIENT_ID!
        },
        {
          key: EngineSettings.Authentication.Oauth.Linkedin.Secret,
          value: process.env.LINKEDIN_CLIENT_SECRET || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Linkedin.Scope.OpenId,
          value: 'openid'
        },
        {
          key: EngineSettings.Authentication.Oauth.Linkedin.Scope.Profile,
          value: 'profile'
        },
        {
          key: EngineSettings.Authentication.Oauth.Linkedin.Scope.Email,
          value: 'email'
        },
        {
          key: EngineSettings.Authentication.Oauth.Twitter.Key,
          value: process.env.TWITTER_CLIENT_ID || ''
        },
        {
          key: EngineSettings.Authentication.Oauth.Twitter.Secret,
          value: process.env.TWITTER_CLIENT_SECRET || ''
        }
      ],
      'authentication'
    )
  ).map((setting) => {
    return {
      ...setting,
      type: (setting.key.startsWith('authStrategies.') ? 'public' : 'private') as EngineSettingType['type']
    }
  })

  // Client settings
  // Exclude fields that should not be migrated
  const clientSettingSeedData = {
    logo: process.env.APP_LOGO || '',
    title: process.env.APP_TITLE || '',
    shortTitle: process.env.APP_TITLE || '',
    startPath: '/',
    releaseName: process.env.RELEASE_NAME || 'local',
    siteDescription: process.env.SITE_DESC || 'IR Engine',
    url:
      process.env.APP_URL ||
      (process.env.VITE_LOCAL_BUILD
        ? 'http://' + process.env.APP_HOST + ':' + process.env.APP_PORT
        : 'https://' + process.env.APP_HOST + ':' + process.env.APP_PORT),
    appleTouchIcon: 'apple-touch-icon.png',
    favicon32px: '/favicon-32x32.png',
    favicon16px: '/favicon-16x16.png',
    icon192px: '/android-chrome-192x192.png',
    icon512px: '/android-chrome-512x512.png',
    siteManifest: '/site.webmanifest',
    safariPinnedTab: '/safari-pinned-tab.svg',
    favicon: '/favicon.ico',
    appBackground: 'static/main-background.png',
    appTitle: 'static/ir-logo.svg',
    appSubtitle: 'IR Engine',
    appDescription: 'FREE, OPEN, & INTEROPERABLE IMMERSIVE WEB TECHNOLOGY',
    gtmContainerId: process.env.GOOGLE_TAG_MANAGER_CONTAINER_ID || '',
    gtmAuth: process.env.GOOGLE_TAG_MANAGER_AUTH || '',
    gtmPreview: process.env.GOOGLE_TAG_MANAGER_PREVIEW || '',
    appSocialLinks: JSON.stringify([
      { icon: 'static/discord.svg', link: 'https://discord.gg/xrf' },
      { icon: 'static/github.svg', link: 'https://github.com/ir-engine' }
    ]),
    privacyPolicy: 'https://www.ir.world/privacy-policy',
    termsOfService: 'https://www.ir.world/terms-of-service',
    assistanceLink: 'https://help.theinfinitereality.com/hc/en-us',
    homepageLinkButtonEnabled: false,
    homepageLinkButtonRedirect: '',
    homepageLinkButtonText: '',
    webmanifestLink: '',
    swScriptLink: '',
    mediaSettings: defaultMediaSettings
  }

  // Create a clean copy of the client setting seed data
  const clientSettingData = { ...clientSettingSeedData }

  // Parse JSON fields if they are strings
  try {
    if (typeof clientSettingData.appSocialLinks === 'string') {
      clientSettingData.appSocialLinks = JSON.parse(clientSettingData.appSocialLinks)
    }
    if (typeof clientSettingData.mediaSettings === 'string') {
      clientSettingData.mediaSettings = JSON.parse(clientSettingData.mediaSettings)
    }
  } catch (error) {
    console.error('Error parsing JSON fields in client settings:', error)
  }

  // Flatten client settings
  const flattenedClientData = flattenObjectToArray(clientSettingData)

  // Create client settings entries
  const clientSeedData = await Promise.all(
    flattenedClientData.map(async (clientSetting) => ({
      id: uuidv4(),
      key: clientSetting.key,
      value: `${clientSetting.value}`,
      dataType: getDataType(`${clientSetting.value}`),
      type: 'public' as EngineSettingType['type'],
      category: 'client',
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  const seedData: EngineSettingType[] = [
    ...taskServerSeedData,
    ...chargebeeSettingSeedData,
    ...coilSeedData,
    ...instanceServerWebRtc,
    ...instanceServerSeedData,
    ...serverSeedData,
    ...metabaseSeedData,
    ...redisSeedData,
    ...zendeskSettingSeedData,
    ...helmSeedData,
    ...awsSeedData,
    ...emailSeedData,
    ...authSeedData,
    ...clientSeedData
  ]

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(engineSettingPath).del()

    // Inserts seed entries
    await knex(engineSettingPath).insert(seedData)
  } else {
    const existingData = await knex(engineSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(engineSettingPath).insert(item)
      }
    }
  }
}

export async function generateSeedData(
  items: { key: string; value: string }[],
  category: EngineSettingType['category'],
  type: EngineSettingType['type'] = 'private'
): Promise<EngineSettingType[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      id: uuidv4(),
      dataType: getDataType(item.value),
      type: type,
      category: category,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )
}
