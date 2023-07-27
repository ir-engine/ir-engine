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

import { Paginated } from '@feathersjs/feathers'

import { InviteType } from '@etherealengine/common/src/interfaces/InviteType'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
const InviteTypeState = defineState({
  name: 'InviteTypeState',
  initial: () => ({
    invitesType: [] as Array<InviteType>,
    skip: 0,
    limit: 5,
    total: 0
  })
})

export const InviteTypeServiceReceptor = (action) => {
  const s = getMutableState(InviteTypeState)
  matches(action).when(InviteTypeAction.retrievedInvitesTypes.matches, (action) => {
    return s.merge({
      invitesType: action.invitesType.data,
      skip: action.skip,
      limit: action.limit,
      total: action.total
    })
  })
}

//Service
export const InviteTypeService = {
  retrieveInvites: async () => {
    dispatchAction(InviteTypeAction.fetchingInvitesTypes({}))
    try {
      const inviteTypeResult = (await API.instance.client.service('invite-type').find()) as Paginated<InviteType>
      dispatchAction(
        InviteTypeAction.retrievedInvitesTypes({
          invitesType: inviteTypeResult,
          total: inviteTypeResult.total,
          skip: inviteTypeResult.skip,
          limit: inviteTypeResult.limit
        })
      )
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export class InviteTypeAction {
  static retrievedInvitesTypes = defineAction({
    type: 'ee.client.InviteType.LOAD_INVITE_TYPE' as const,
    total: matches.number,
    limit: matches.number,
    invitesType: matches.any as Validator<unknown, Paginated<InviteType>>,
    skip: matches.number
  })

  static fetchingInvitesTypes = defineAction({
    type: 'ee.client.InviteType.FETCHING_RECEIVED_INVITES_TYPES' as const
  })
}
