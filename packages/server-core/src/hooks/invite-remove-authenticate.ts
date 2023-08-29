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

import {
  IdentityProviderType,
  identityProviderPath
} from '@etherealengine/engine/src/schemas/user/identity-provider.schema'

import { invitePath } from '@etherealengine/engine/src/schemas/social/invite.schema'
import { UserType } from '@etherealengine/engine/src/schemas/user/user.schema'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    let inviteIdentityProviderUser
    // Getting logged in user and attaching owner of user
    const { id, params, app } = context
    const loggedInUser = params.user as UserType
    const invite = await app.service(invitePath).get(id!)
    if (invite == null) {
      throw new BadRequest('Invalid invite ID')
    }
    if (invite.identityProviderType != null) {
      const inviteeIdentityProviderResult = (await app.service(identityProviderPath).find({
        query: {
          type: invite.identityProviderType,
          token: invite.token
        }
      })) as Paginated<IdentityProviderType>
      if (inviteeIdentityProviderResult.total > 0) {
        inviteIdentityProviderUser = inviteeIdentityProviderResult.data[0].userId
      }
    }
    if (
      invite.userId !== loggedInUser?.id &&
      invite.inviteeId !== loggedInUser?.id &&
      inviteIdentityProviderUser !== loggedInUser?.id
    ) {
      throw new BadRequest('Not the sender or recipient of this invite')
    }
    return context
  }
}
