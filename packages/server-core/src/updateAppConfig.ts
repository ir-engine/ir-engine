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

import dotenv from 'dotenv'
import knex from 'knex'

import { AwsSettingDatabaseType, awsSettingPath } from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'
import {
  ChargebeeSettingType,
  chargebeeSettingPath
} from '@etherealengine/engine/src/schemas/setting/chargebee-setting.schema'
import {
  ClientSettingDatabaseType,
  clientSettingPath
} from '@etherealengine/engine/src/schemas/setting/client-setting.schema'
import { CoilSettingType, coilSettingPath } from '@etherealengine/engine/src/schemas/setting/coil-setting.schema'
import {
  EmailSettingDatabaseType,
  emailSettingPath
} from '@etherealengine/engine/src/schemas/setting/email-setting.schema'
import {
  InstanceServerSettingType,
  instanceServerSettingPath
} from '@etherealengine/engine/src/schemas/setting/instance-server-setting.schema'
import { RedisSettingType, redisSettingPath } from '@etherealengine/engine/src/schemas/setting/redis-setting.schema'
import {
  ServerSettingDatabaseType,
  serverSettingPath
} from '@etherealengine/engine/src/schemas/setting/server-setting.schema'
import {
  TaskServerSettingType,
  taskServerSettingPath
} from '@etherealengine/engine/src/schemas/setting/task-server-setting.schema'
import {
  AuthenticationSettingDatabaseType,
  authenticationSettingPath
} from './../../engine/src/schemas/setting/authentication-setting.schema'

import logger from './ServerLogger'
import appConfig from './appconfig'
import { authenticationDbToSchema } from './setting/authentication-setting/authentication-setting.resolvers'
import { awsDbToSchema } from './setting/aws-setting/aws-setting.resolvers'
import { clientDbToSchema } from './setting/client-setting/client-setting.resolvers'
import { emailDbToSchema } from './setting/email-setting/email-setting.resolvers'
import { serverDbToSchema } from './setting/server-setting/server-setting.resolvers'

dotenv.config()
const db = {
  user: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'etherealengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306
}
const nonFeathersStrategies = ['emailMagicLink', 'smsMagicLink']

export const updateAppConfig = async (): Promise<void> => {
  if (appConfig.db.forceRefresh || !appConfig.kubernetes.enabled) return

  const knexClient = knex({
    client: 'mysql',
    connection: {
      ...db,
      port: parseInt(db.port.toString()),
      charset: 'utf8mb4'
    }
  })

  const promises: any[] = []

  const taskServerSettingPromise = knexClient
    .select()
    .from<TaskServerSettingType>(taskServerSettingPath)
    .then(([dbTaskServer]) => {
      if (dbTaskServer) {
        appConfig.taskserver = {
          ...appConfig.taskserver,
          ...dbTaskServer
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read taskServerSetting: ${e.message}`)
    })
  promises.push(taskServerSettingPromise)

  const authenticationSettingPromise = knexClient
    .select()
    .from<AuthenticationSettingDatabaseType>(authenticationSettingPath)
    .then(([dbAuthentication]) => {
      const dbAuthenticationConfig = authenticationDbToSchema(dbAuthentication)
      if (dbAuthenticationConfig) {
        const authStrategies = ['jwt']
        for (let authStrategy of dbAuthenticationConfig.authStrategies) {
          const keys = Object.keys(authStrategy)
          for (let key of keys)
            if (nonFeathersStrategies.indexOf(key) < 0 && authStrategies.indexOf(key) < 0) authStrategies.push(key)
        }
        delete (dbAuthenticationConfig as any).authStrategies

        appConfig.authentication = {
          ...appConfig.authentication,
          ...(dbAuthenticationConfig as any),
          authStrategies: authStrategies
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read ${authenticationSettingPath}: ${e.message}`)
    })
  promises.push(authenticationSettingPromise)

  const awsSettingPromise = knexClient
    .select()
    .from<AwsSettingDatabaseType>(awsSettingPath)
    .then(([dbAws]) => {
      const dbAwsConfig = awsDbToSchema(dbAws)
      if (dbAwsConfig) {
        appConfig.aws = {
          ...appConfig.aws,
          ...dbAwsConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read ${awsSettingPath}: ${e.message}`)
    })
  promises.push(awsSettingPromise)

  const chargebeeSettingPromise = knexClient
    .select()
    .from<ChargebeeSettingType>(chargebeeSettingPath)
    .then(([dbChargebee]) => {
      if (dbChargebee) {
        appConfig.chargebee = {
          ...appConfig.chargebee,
          ...dbChargebee
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read chargebeeSetting: ${e.message}`)
    })
  promises.push(chargebeeSettingPromise)

  const coilSettingPromise = knexClient
    .select()
    .from<CoilSettingType>(coilSettingPath)
    .then(([dbCoil]) => {
      if (dbCoil) {
        appConfig.coil = {
          ...appConfig.coil,
          ...dbCoil
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read coilSetting: ${e.message}`)
    })
  promises.push(coilSettingPromise)

  const clientSettingPromise = knexClient
    .select()
    .from<ClientSettingDatabaseType>(clientSettingPath)
    .then(([dbClient]) => {
      const dbClientConfig = clientDbToSchema(dbClient)
      if (dbClientConfig) {
        appConfig.client = {
          ...appConfig.client,
          ...dbClientConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read clientSetting: ${e.message}`)
    })
  promises.push(clientSettingPromise)

  const emailSettingPromise = knexClient
    .select()
    .from<EmailSettingDatabaseType>(emailSettingPath)
    .then(([dbEmail]) => {
      const dbEmailConfig = emailDbToSchema(dbEmail)
      if (dbEmailConfig) {
        appConfig.email = {
          ...appConfig.email,
          ...dbEmailConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read emailSetting: ${e.message}`)
    })
  promises.push(emailSettingPromise)

  const instanceServerSettingPromise = knexClient
    .select()
    .from<InstanceServerSettingType>(instanceServerSettingPath)
    .then(([dbInstanceServer]) => {
      if (dbInstanceServer) {
        appConfig.instanceserver = {
          ...appConfig.instanceserver,
          ...dbInstanceServer
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read instanceServerSetting: ${e.message}`)
    })
  promises.push(instanceServerSettingPromise)

  const redisSettingPromise = knexClient
    .select()
    .from<RedisSettingType>(redisSettingPath)
    .then(([dbRedis]) => {
      const dbRedisConfig = dbRedis && {
        enabled: dbRedis.enabled,
        address: dbRedis.address,
        port: dbRedis.port,
        password: dbRedis.password
      }
      if (dbRedisConfig) {
        appConfig.redis = {
          ...appConfig.redis,
          ...dbRedisConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read redisSetting: ${e.message}`)
    })
  promises.push(redisSettingPromise)

  const serverSettingPromise = knexClient
    .select()
    .from<ServerSettingDatabaseType>(serverSettingPath)
    .then(([dbServer]) => {
      const dbServerConfig = serverDbToSchema(dbServer)
      if (dbServerConfig) {
        appConfig.server = {
          ...appConfig.server,
          ...dbServerConfig
        }
      }
    })
    .catch((e) => {
      logger.error(e, `[updateAppConfig]: Failed to read serverSetting: ${e.message}`)
    })
  promises.push(serverSettingPromise)

  await Promise.all(promises)
}
