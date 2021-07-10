import Instance from './instance/instance.service'
import InstanceProvision from './instance-provision/instance-provision.service'
import GameServerSubdomainProvision from './gameserver-subdomain-provision/gameserver-subdomain-provision.service'
import RtcPorts from './rtc-ports/rtc-ports.service'

export default [RtcPorts, Instance, GameServerSubdomainProvision, InstanceProvision]
