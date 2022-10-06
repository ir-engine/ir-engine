import InstanceAttendance from './instance-attendance/instance-attendance.service'
import InstanceAuthorizedUser from './instance-authorized-user/instance-authorized-user.service'
import InstanceProvision from './instance-provision/instance-provision.service'
import Instance from './instance/instance.service'
import InstanceServerLoad from './instanceserver-load/instanceserver-load.service'
import InstanceServerProvision from './instanceserver-provision/instanceserver-provision.service'
import InstanceServerSubdomainProvision from './instanceserver-subdomain-provision/instanceserver-subdomain-provision.service'

export default [
  Instance,
  InstanceServerLoad,
  InstanceServerProvision,
  InstanceServerSubdomainProvision,
  InstanceProvision,
  InstanceAttendance,
  InstanceAuthorizedUser
]
