import Channel from './channel/channel.service';
import GroupUserRank from './group-user-rank/group-user-rank.service';
import GroupUser from './group-user/group-user.service';
import Group from './group/group.service';
import InstanceProvision from './instance-provision/instance-provision.service';
import InviteType from './invite-type/invite-type.service';
import Invite from './invite/invite.service';
import LocationAdmin from './location-admin/location-admin.service';
import LocationBan from './location-ban/location-ban.service';
import LocationSettings from './location-settings/location-settings.service';
import LocationType from './location-type/location-type.service';
import MessageStatus from './message-status/message-status.service';
import Message from './message/message.service';
import Party from './party/party.service';
import UserRelationshipType from './user-relationship-type/user-relationship-type.service';
import UserRelationship from './user-relationship/user-relationship.service';

export default [
  Channel,
  GroupUserRank,
  InviteType,
  UserRelationshipType,
  Group,
  Invite,
  Party,
  UserRelationship,
  GroupUser,
  Message,
  MessageStatus,
  LocationType,
  LocationSettings,
  LocationBan,
  LocationAdmin,
  Channel,
  InstanceProvision
]