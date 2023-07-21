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

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { buildStatusPath, BuildStatusType } from '@etherealengine/engine/src/schemas/cluster/build-status.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
export const AdminBuildStatusState = defineState({
  name: 'AdminBuildStatusState',
  initial: () => ({
    buildStatuses: [] as Array<BuildStatusType>,
    skip: 0,
    limit: 10,
    total: 0,
    fetched: false,
    updateNeeded: true
  })
})

const fetchBuildStatusReceptor = (action: typeof AdminBuildStatusActions.fetchBuildStatusRetrieved.matches._TYPE) => {
  try {
    const state = getMutableState(AdminBuildStatusState)
    return state.merge({
      buildStatuses: action.data,
      skip: action.skip,
      limit: action.limit,
      total: action.total,
      fetched: true,
      updateNeeded: false
    })
  } catch (err) {
    NotificationService.dispatchNotify(err.message, { variant: 'error' })
  }
}

export const AdminBuildStatusReceptors = {
  fetchBuildStatusReceptor
}

//Service
export const BuildStatusService = {
  fetchBuildStatus: async (skip = 0) => {
    let buildStatusResult = await API.instance.client.service(buildStatusPath).find({
      query: {
        $limit: 10,
        $skip: skip,
        $sort: {
          id: -1
        }
      }
    })

    dispatchAction(
      AdminBuildStatusActions.fetchBuildStatusRetrieved({
        data: buildStatusResult.data,
        total: buildStatusResult.total,
        skip: buildStatusResult.total,
        limit: buildStatusResult.limit
      })
    )
  }
}

//Action
export class AdminBuildStatusActions {
  static fetchBuildStatusRetrieved = defineAction({
    type: 'ee.client.AdminBuildStatus.FETCH_BUILD_STATUS_RETRIEVED' as const,
    data: matches.array as Validator<unknown, BuildStatusType[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })
}
