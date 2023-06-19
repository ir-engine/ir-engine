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

import { BadRequest, Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    let fetchedGroupId
    const { id, method, params, app, path } = context
    const loggedInUser = params.user as UserInterface
    if (path === 'group-user' && method === 'remove') {
      const groupUser = await app.service('group-user').get(id!, null!)
      fetchedGroupId = groupUser.groupId
    }
    const groupId =
      path === 'group-user' && method === 'find' ? params.query!.groupId : fetchedGroupId != null ? fetchedGroupId : id
    params.query!.groupId = groupId
    const userId = path === 'group' ? loggedInUser.id : params.query!.userId || loggedInUser.id
    const groupUserCountResult = await app.service('group-user').find({
      query: {
        groupId: groupId,
        $limit: 0
      }
    })
    if (groupUserCountResult.total > 0) {
      const groupUserResult = await app.service('group-user').find({
        query: {
          groupId: groupId,
          userId: userId
        }
      })
      if (groupUserResult.total === 0) {
        throw new BadRequest('Invalid group ID')
      }
      const groupUser = groupUserResult.data[0]
      if (
        params.groupUsersRemoved !== true &&
        groupUser.groupUserRank !== 'owner' &&
        groupUser.groupUserRank !== 'admin' &&
        groupUser.userId !== loggedInUser.id
      ) {
        throw new Forbidden('You must be the owner or an admin of this group to perform that action')
      }
    }

    if (path === 'group') {
      delete params.query!.groupId
    }
    return context
  }
}
