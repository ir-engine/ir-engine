import { serverSeed } from './server-setting/server-setting.seed'
import { clientSeed } from './client-setting/client-setting.seed'
import { gameServerSeed } from './game-server-setting/game-server-setting.seed'
import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { emailSeed } from './email-setting/email-setting.seed'
import { authenticationSeed } from './authentication-setting/authentication.seed'
import { awsSeed } from './aws-setting/aws-setting.seed'
import { chargebeeSeed } from './chargebee-setting/chargebee-setting.seed'
import { redisSeed } from './redis-setting/redis-setting.seed'
import { analyticsSeed } from './analytics-setting/analytics.seed'

export const settingSeeds: Array<ServicesSeedConfig> = [
  serverSeed,
  clientSeed,
  gameServerSeed,
  emailSeed,
  authenticationSeed,
  awsSeed,
  chargebeeSeed,
  redisSeed,
  analyticsSeed
]

export default settingSeeds
