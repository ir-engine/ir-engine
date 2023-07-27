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

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { buildStatusPath, BuildStatusType } from '@etherealengine/engine/src/schemas/cluster/build-status.schema'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

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

//Service
export const BuildStatusService = {
  fetchBuildStatus: async (skip = 0) => {
    let buildStatusResult = await Engine.instance.api.service(buildStatusPath).find({
      query: {
        $limit: 10,
        $skip: skip,
        $sort: {
          id: -1
        }
      }
    })

    getMutableState(AdminBuildStatusState).merge({
      buildStatuses: buildStatusResult.data,
      total: buildStatusResult.total,
      skip: buildStatusResult.total,
      limit: buildStatusResult.limit,
      fetched: true,
      updateNeeded: false
    })
  }
}
