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

import { BadRequest } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'

import { MessageID, MessageType, messagePath } from '@etherealengine/engine/src/schemas/social/message.schema'
import { UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from './../../declarations'

/**
 * Checks if the requesting user is the owner of the message
 */
export default () => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    const { id, params, app } = context
    const loggedInUser = params.user as UserType

    if (!id) {
      throw new BadRequest('Must provide a message ID')
    }

    const match = (await app.service(messagePath).find({
      query: {
        id: id.toString() as MessageID,
        senderId: loggedInUser.id,
        $limit: 1
      }
    })) as Paginated<MessageType>

    if (match.data.length === 0) {
      throw new BadRequest('Message not owned by requesting user')
    }

    return context
  }
}
