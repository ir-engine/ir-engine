import Analytics from './analytics-setting/analytics.service'
import Authentication from './authentication-setting/authentication.service'
import Aws from './aws-setting/aws-setting.service'
import Chargebee from './chargebee-setting/chargebee-setting.service'
import ClientSetting from './client-setting/client-setting.service'
import Email from './email-setting/email-setting.service'
import GameServer from './game-server-setting/game-server-setting.service'
import RedisSetting from './redis-setting/redis-setting.service'
import ServerSetting from './server-setting/server-setting.service'

export default [
  ServerSetting,
  ClientSetting,
  GameServer,
  Email,
  Authentication,
  Aws,
  Chargebee,
  RedisSetting,
  Analytics
]
