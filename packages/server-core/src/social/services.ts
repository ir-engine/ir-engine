/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import Location from '../social/location/location.service'
import ChannelType from './channel-type/channel-type.service'
import Channel from './channel/channel.service'
import GroupUserRank from './group-user-rank/group-user-rank.service'
import GroupUser from './group-user/group-user.service'
import Group from './group/group.service'
import InviteType from './invite-type/invite-type.service'
import Invite from './invite/invite.service'
import LocationAdmin from './location-admin/location-admin.service'
import LocationAuthorizedUser from './location-authorized-user/location-authorized-user.service'
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
  LocationAdmin,
  LocationAuthorizedUser
]
