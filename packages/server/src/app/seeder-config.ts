import ChannelTypeSeed from '../services/channel-type/channel-type.seed';
import CollectionTypeSeed from '../services/collection-type/collection-type.seed';
import ComponentTypeSeed from '../services/component-type/component-type.seed';
import EntityTypeSeed from '../services/entity-type/entity-type.seed';
import GroupUserRankSeed from '../services/group-user-rank/group-user-rank.seed';
import InviteTypeSeed from '../services/invite-type/invite-type.seed';
import LocationSeed from '../services/location/location.seed';
import LocationTypeSeed from '../services/location-type/location-type.seed';
import MessageStatusSeed from '../services/message-status/message-status.seed';
import SeatStatusSeed from '../services/seat-status/seat-status.seed';
import StaticResourceTypeSeed from '../services/static-resource-type/static-resource-type.seed';
import SubscriptionLevelSeed from '../services/subscription-level/subscription-level.seed';
import SubscriptionTypeSeed from '../services/subscription-type/subscription-type.seed';
import UserRelationshipTypeSeed from '../services/user-relationship-type/user-relationship-type.seed';
import UserRoleSeed from '../services/user-role/user-role.seed';

export const services = [
    LocationTypeSeed,
    ChannelTypeSeed,
    CollectionTypeSeed,
    MessageStatusSeed,
    ComponentTypeSeed,
    EntityTypeSeed,
    GroupUserRankSeed,
    InviteTypeSeed,
    LocationSeed,
    SeatStatusSeed,
    StaticResourceTypeSeed,
    SubscriptionLevelSeed,
    SubscriptionTypeSeed,
    UserRelationshipTypeSeed,
    UserRoleSeed
  ];

export default services;
