import Instance from './instance/instance.service'
import InstanceAttendance from './instance-attendance/instance-attendance.service'
import InstanceProvision from './instance-provision/instance-provision.service'
import InstanceAuthorizedUser from './instance-authorized-user/instance-authorized-user.service'
import GameServerSubdomainProvision from './gameserver-subdomain-provision/gameserver-subdomain-provision.service'
import RtcPorts from './rtc-ports/rtc-ports.service'

export default [RtcPorts, Instance, GameServerSubdomainProvision, InstanceProvision, InstanceAttendance, InstanceAuthorizedUser]
