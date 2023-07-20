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

import { Party, PatchParty } from '@etherealengine/common/src/interfaces/Party'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

import { NotificationService } from '../../common/services/NotificationService'
import { userIsAdmin } from '../../user/userHasAccess'

export const PARTY_PAGE_LIMIT = 100

export const AdminPartyState = defineState({
  name: 'AdminPartyState',
  initial: () => ({
    parties: [] as Array<Party>,
    skip: 0,
    limit: PARTY_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

export const AdminPartyService = {
  createAdminParty: async (data) => {
    try {
      await Engine.instance.api.service('party').create(data)
      getMutableState(AdminPartyState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  fetchAdminParty: async (value: string | null = null, skip = 0, sortField = 'maxMembers', orderBy = 'asc') => {
    try {
      if (userIsAdmin()) {
        const sortData = sortField.length > 0 ? { [sortField]: orderBy === 'desc' ? 0 : 1 } : {}
        const party = (await Engine.instance.api.service('party').find({
          query: {
            $sort: {
              ...sortData
            },
            $skip: skip * PARTY_PAGE_LIMIT,
            $limit: PARTY_PAGE_LIMIT,
            action: 'admin',
            search: value
          }
        })) as Paginated<Party>

        getMutableState(AdminPartyState).merge({
          parties: party.data,
          updateNeeded: false,
          skip: party.skip,
          limit: party.limit,
          total: party.total,
          fetched: true,
          lastFetched: Date.now()
        })
      }
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeParty: async (id: string) => {
    await Engine.instance.api.service('party').remove(id)
    getMutableState(AdminPartyState).merge({ updateNeeded: true })
  },
  patchParty: async (id: string, party: PatchParty) => {
    try {
      await Engine.instance.api.service('party').patch(id, party)
      getMutableState(AdminPartyState).merge({ updateNeeded: true })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}
