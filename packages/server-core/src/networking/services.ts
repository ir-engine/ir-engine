import Instance from './instance/instance.service';
import InstanceProvision from './instance-provision/instance-provision.service';
import GameServerSubdomainProvision from './gameserver-subdomain-provision/gameserver-subdomain-provision.service';

export default [
  Instance,
  GameServerSubdomainProvision,
  InstanceProvision
];
