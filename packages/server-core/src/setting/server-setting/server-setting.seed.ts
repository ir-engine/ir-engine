import appRootPath from 'app-root-path'
import { Knex } from 'knex'
import path from 'path'
import url from 'url'
import { v4 } from 'uuid'

import {
  ServerSettingDatabaseType,
  serverSettingPath
} from '@etherealengine/engine/src/schemas/setting/server-setting.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

const kubernetesEnabled = process.env.KUBERNETES === 'true'

const server = {
  mode: process.env.SERVER_MODE!,
  hostname: process.env.SERVER_HOST!,
  port: process.env.SERVER_PORT!,
  clientHost: process.env.APP_HOST!,
  rootDir: path.resolve(appRootPath.path, 'packages', 'server'),
  publicDir:
    process.env.SERVER_PUBLIC_DIR ||
    (process.env.BUILD_MODE === 'individual'
      ? path.resolve(appRootPath.path, 'public')
      : path.resolve(appRootPath.path, 'packages', 'server', 'public')),
  nodeModulesDir: path.resolve(__dirname, '../..', 'node_modules'),
  localStorageProvider: process.env.LOCAL_STORAGE_PROVIDER ?? 's3',
  performDryRun: process.env.PERFORM_DRY_RUN === 'true',
  storageProvider: process.env.STORAGE_PROVIDER!,
  gaTrackingId: process.env.GOOGLE_ANALYTICS_TRACKING_ID || null!,
  hub: JSON.stringify({
    endpoint: process.env.HUB_ENDPOINT
  }),
  url: '' || (null! as string),
  certPath: appRootPath.path.toString() + '/' + process.env.CERT,
  keyPath: appRootPath.path.toString() + '/' + process.env.KEY,
  gitPem: '',
  local: process.env.LOCAL === 'true',
  releaseName: process.env.RELEASE_NAME || 'local',
  instanceserverUnreachableTimeoutSeconds: parseInt(process.env.INSTANCESERVER_UNREACHABLE_TIMEOUT_SECONDS || '2'),
  githubWebhookSecret: ''
}

server.url =
  process.env.SERVER_URL ||
  url.format(kubernetesEnabled ? { protocol: 'https', hostname: server.hostname } : { protocol: 'https', ...server })

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: ServerSettingDatabaseType[] = await Promise.all(
    [server].map(async (item) => ({
      ...item,
      id: v4(),
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(serverSettingPath).del()

    // Inserts seed entries
    await knex(serverSettingPath).insert(seedData)
  } else {
    const existingData = await knex(serverSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(serverSettingPath).insert(item)
      }
    }
  }
}
