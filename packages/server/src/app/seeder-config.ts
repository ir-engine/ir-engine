import ChannelTypeSeed from '../services/channel-type/channel-type.seed';
import CollectionTypeSeed from '../services/collection-type/collection-type.seed';
import CollectionSeed from '../services/collection/collection.seed';
import ComponentTypeSeed from '../services/component-type/component-type.seed';
import ComponentSeed from '../services/component/component.seed';
import EntitySeed from '../services/entity/entity.seed';
import GroupUserRankSeed from '../services/group-user-rank/group-user-rank.seed';
import InviteTypeSeed from '../services/invite-type/invite-type.seed';
import LocationTypeSeed from '../services/location-type/location-type.seed';
import LocationSeed from '../services/location/location.seed';
import MessageStatusSeed from '../services/message-status/message-status.seed';
import StaticResourceTypeSeed from '../services/static-resource-type/static-resource-type.seed';
import StaticResourceSeed from '../services/static-resource/static-resource.seed';
import UserRelationshipTypeSeed from '../services/user-relationship-type/user-relationship-type.seed';
import UserRoleSeed from '../services/user-role/user-role.seed';
import User  from '../services/user/user.seed';
import Feed  from '../services/feed/feed.seed';
import FeedFire  from '../services/feed-fires/feed-fires.seed';
import FeedBookmark  from '../services/feed-bookmark/feed-bookmark.seed';

export const services = [
    ChannelTypeSeed,
    CollectionTypeSeed,
    CollectionSeed,
    EntitySeed,
    GroupUserRankSeed,
    InviteTypeSeed,
    ComponentTypeSeed,
    ComponentSeed,
    LocationTypeSeed,
    LocationSeed,
    MessageStatusSeed,
    StaticResourceTypeSeed,
    StaticResourceSeed,
    User,
    UserRelationshipTypeSeed,
    UserRoleSeed,
    Feed
    // FeedFire
    // FeedBookmark
  ];

export default services;
