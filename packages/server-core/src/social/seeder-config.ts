import ChannelTypeSeed from './channel-type/channel-type.seed';
import GroupUserRankSeed from './group-user-rank/group-user-rank.seed';
import InviteTypeSeed from './invite-type/invite-type.seed';
import LocationTypeSeed from './location-type/location-type.seed';
import LocationSeed from './location/location.seed';
import LocationSetttingsSeed from './location-settings/location-settings.seed';
import MessageStatusSeed from './message-status/message-status.seed';

type SeedCallback = (ServicesSeedConfig) => Promise<any>;
type ServicesSeedCallback = (obj: any, seed: SeedCallback) => Promise<any>;

interface ServicesSeedConfig {
    count?: number;
    disabled: boolean;
    delete: boolean;
    path: string;
    randomize?: boolean;
    templates?: any[];
    callback?: ServicesSeedCallback;
}

export const services: Array<ServicesSeedConfig> = [
    GroupUserRankSeed,
    InviteTypeSeed,
    MessageStatusSeed,
    ChannelTypeSeed,
    LocationTypeSeed,
    LocationSeed,
  ];

export default services;
