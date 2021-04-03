import { Application } from '../../declarations';

import LocationType from './location-type/location-type.service';
import Instance from './instance/instance.service';
import Location from './location/location.service';
import LocationSettings from './location-settings/location-settings.service';
import LocationBan from './location-ban/location-ban.service';
import LocationAdmin from './location-admin/location-admin.service';

import Channel from './channel/channel.service';
import InstanceProvision from './instance-provision/instance-provision.service';

export default [
  LocationType,
  Instance,
  Location,
  LocationSettings,
  LocationBan,
  LocationAdmin,
  Channel,
  InstanceProvision
];
