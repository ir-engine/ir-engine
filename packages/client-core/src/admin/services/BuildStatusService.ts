import { Paginated } from '@feathersjs/feathers'

import { BuildStatus } from '@etherealengine/common/src/interfaces/BuildStatus'
import { BuildStatusResult } from '@etherealengine/common/src/interfaces/BuildStatusResult'
import { Invite } from '@etherealengine/common/src/interfaces/Invite'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState, useState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
const AdminBuildStatusState = defineState({
  name: 'AdminBuildStatusState',
  initial: () => ({
    buildStatuses: [] as Array<BuildStatus>,
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

export const accessBuildStatusState = () => getMutableState(AdminBuildStatusState)

export const useBuildStatusState = () => useState(accessBuildStatusState())

//Service
export const BuildStatusService = {
  fetchBuildStatus: async (skip = 0) => {
    let buildStatusResult = (await API.instance.client.service('build-status').find({
      query: {
        $limit: 10,
        $skip: skip,
        $sort: {
          id: 'desc'
        }
      }
    })) as BuildStatusResult

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
    type: 'xre.client.AdminBuildStatus.FETCH_BUILD_STATUS_RETRIEVED' as const,
    data: matches.array as Validator<unknown, BuildStatus[]>,
    total: matches.number,
    limit: matches.number,
    skip: matches.number
  })
}
