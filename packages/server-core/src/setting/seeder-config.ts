import { KnexSeed } from '@etherealengine/common/src/interfaces/KnexSeed'
import { ServicesSeedConfig } from '@etherealengine/common/src/interfaces/ServicesSeedConfig'

import { authenticationSeed } from './authentication-setting/authentication.seed'
import { awsSeed } from './aws-setting/aws-setting.seed'
import * as chargebeeSeed from './chargebee-setting/chargebee-setting.seed'
import { clientSeed } from './client-setting/client-setting.seed'
import { coilSeed } from './coil-setting/coil-setting.seed'
import { emailSeed } from './email-setting/email-setting.seed'
import { instanceServerSeed } from './instance-server-setting/instance-server-setting.seed'
import { redisSeed } from './redis-setting/redis-setting.seed'
import { serverSeed } from './server-setting/server-setting.seed'
import * as taskServerSeed from './task-server-setting/task-server-setting.seed'

export const settingSequelizeSeeds: Array<ServicesSeedConfig> = [
  serverSeed,
  clientSeed,
  instanceServerSeed,
  emailSeed,
  authenticationSeed,
  awsSeed,
  coilSeed,
  redisSeed
]

export default settingSequelizeSeeds

export const settingSeeds: Array<KnexSeed> = [chargebeeSeed, taskServerSeed]
