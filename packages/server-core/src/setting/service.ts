import Authentication from './authentication-setting/authentication.service'
import Aws from './aws-setting/aws-setting.service'
import Chargebee from './chargebee-setting/chargebee-setting'
import ClientSetting from './client-setting/client-setting.service'
import Coil from './coil-setting/coil-setting'
import Email from './email-setting/email-setting'
import InstanceServer from './instance-server-setting/instance-server-setting.service'
import ProjectSetting from './project-setting/project-setting.service'
import RedisSetting from './redis-setting/redis-setting'
import ServerSetting from './server-setting/server-setting.service'
import TaskServer from './task-server-setting/task-server-setting'

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
  TaskServer,
  ProjectSetting
]
