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

import { Group } from './Group'
import { Instance } from './Instance'
import { Message } from './Message'
import { Party } from './Party'
import { UserInterface } from './User'
import { UserId } from './UserId'

/** @deprecated */
export type ChannelType = 'channel' | 'user' | 'group' | 'instance' | 'party'

export type Channel = {
  id: string
  ownerId: UserId
  messages: Message[]
  updatedAt: string
  updateNeeded: boolean
  limit: 5
  skip: 0
  total: 0
  /** @deprecated */
  channelType: ChannelType
  /** @deprecated */
  userId1: string | null
  /** @deprecated */
  userId2: string | null
  /** @deprecated */
  groupId: string | null
  /** @deprecated */
  partyId: string | null
  /** @deprecated */
  instanceId: string | null
  /** @deprecated */
  user1: UserInterface
  /** @deprecated */
  user2: UserInterface
  /** @deprecated */
  group: Group
  /** @deprecated */
  party: Party
  /** @deprecated */
  instance: Instance
}
