import Location from '../social/location/location.service'
import ChannelType from './channel-type/channel-type.service'
import Channel from './channel/channel.service'
import GroupUserRank from './group-user-rank/group-user-rank.service'
import GroupUser from './group-user/group-user.service'
import Group from './group/group.service'
import InviteType from './invite-type/invite-type.service'
import Invite from './invite/invite.service'
import LocationAdmin from './location-admin/location-admin.service'
import LocationBan from './location-ban/location-ban.service'
import LocationSettings from './location-settings/location-settings.service'
import LocationType from './location-type/location-type.service'
import MessageStatus from './message-status/message-status.service'
import Message from './message/message.service'
import PartyUser from './party-user/party-user.service'
import Party from './party/party.service'

export default [
  ChannelType,
  InviteType,
  Channel,
  Location,
  GroupUserRank,
  Group,
  Invite,
  Party,
  PartyUser,
  GroupUser,
  Message,
  MessageStatus,
  LocationType,
  LocationSettings,
  LocationBan,
  LocationAdmin
]
