import Analytics from './analytics-setting/analytics.service'
import Authentication from './authentication-setting/authentication.service'
import Aws from './aws-setting/aws-setting.service'
import Chargebee from './chargebee-setting/chargebee-setting.service'
import ClientSetting from './client-setting/client-setting.service'
import Coil from './coil-setting/coil-setting.service'
import Email from './email-setting/email-setting.service'
import InstanceServer from './instance-server-setting/instance-server-setting.service'
import ProjectSetting from './project-setting/project-setting.service'
import RedisSetting from './redis-setting/redis-setting.service'
import ServerSetting from './server-setting/server-setting.service'

export default [
  ServerSetting,
  ClientSetting,
  InstanceServer,
  Email,
  Authentication,
  Aws,
  Chargebee,
  Coil,
  RedisSetting,
  Analytics,
  ProjectSetting
]
