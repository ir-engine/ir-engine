import GameServerLoad from './gameserver-load/gameserver-load.service'
import GameServerProvision from './gameserver-provision/gameserver-provision.service'
import GameServerSubdomainProvision from './gameserver-subdomain-provision/gameserver-subdomain-provision.service'
import InstanceAttendance from './instance-attendance/instance-attendance.service'
import InstanceAuthorizedUser from './instance-authorized-user/instance-authorized-user.service'
import InstanceProvision from './instance-provision/instance-provision.service'
import Instance from './instance/instance.service'
import RtcPorts from './rtc-ports/rtc-ports.service'

export default [
  RtcPorts,
  Instance,
  GameServerLoad,
  GameServerProvision,
  GameServerSubdomainProvision,
  InstanceProvision,
  InstanceAttendance,
  InstanceAuthorizedUser
]
