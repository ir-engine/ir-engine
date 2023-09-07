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

import ChannelUser from './channel-user/channel-user'
import Channel from './channel/channel'
import InviteCodeLookup from './invite-code-lookup/invite-code-lookup'
import InviteType from './invite-type/invite-type'
import Invite from './invite/invite'
import LocationAdmin from './location-admin/location-admin'
import LocationAuthorizedUser from './location-authorized-user/location-authorized-user'
import LocationBan from './location-ban/location-ban'
import LocationSetting from './location-setting/location-setting'
import LocationType from './location-type/location-type'
import Location from './location/location'
import Message from './message/message'

export default [
  ChannelUser,
  InviteType,
  Channel,
  Location,
  Invite,
  InviteCodeLookup,
  Message,
  LocationType,
  LocationSetting,
  LocationBan,
  LocationAdmin,
  LocationAuthorizedUser
]
