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
import { useEffect } from 'react'

import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

type RecordingResultFetch = RecordingResult & { 'user.name': string }

export const RECORDING_PAGE_LIMIT = 10

export const AdminRecordingState = defineState({
  name: 'AdminRecordingState',
  initial: () => ({
    recordings: [] as Array<RecordingResultFetch>,
    skip: 0,
    limit: RECORDING_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

const recordingsRetrievedReceptor = (action: typeof AdminRecordingsActions.recordingsRetrieved.matches._TYPE) => {
  const state = getMutableState(AdminRecordingState)
  return state.merge({
    recordings: action.recordingsResult.data,
    skip: action.recordingsResult.skip,
    limit: action.recordingsResult.limit,
    total: action.recordingsResult.total,
    retrieving: false,
    fetched: true,
    updateNeeded: false,
    lastFetched: Date.now()
  })
}

const recordingRemovedReceptor = (_action: typeof AdminRecordingsActions.recordingsRemoved.matches._TYPE) => {
  const state = getMutableState(AdminRecordingState)
  return state.merge({ updateNeeded: true })
}

export const AdminRecordingReceptors = {
  recordingsRetrievedReceptor,
  recordingRemovedReceptor
}

//Service
export const AdminRecordingService = {
  fetchAdminRecordings: async (
    _value: string | null = null,
    $skip = 0,
    sortField = 'createdAt',
    orderBy = 'asc',
    $limit = RECORDING_PAGE_LIMIT
  ) => {
    try {
      let $sort = {}
      if (sortField.length > 0) {
        $sort[sortField] = orderBy === 'desc' ? -1 : 1
      }
      const recordings = (await API.instance.client.service('recording').find({
        query: {
          $skip,
          $sort,
          $limit,
          action: 'admin'
        }
      })) as Paginated<RecordingResultFetch>

      dispatchAction(AdminRecordingsActions.recordingsRetrieved({ recordingsResult: recordings }))
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  },
  removeRecording: async (id: string) => {
    const recording = (await API.instance.client.service('recording').remove(id)) as RecordingResult
    dispatchAction(AdminRecordingsActions.recordingsRemoved({ recording }))
  },
  useAPIListeners: () => {
    useEffect(() => {
      const listener = (params) => {
        dispatchAction(AdminRecordingsActions.recordingsRemoved({ recording: params.recording }))
      }
      API.instance.client.service('instance').on('removed', listener)
      return () => {
        API.instance.client.service('instance').off('removed', listener)
      }
    }, [])
  }
}

export class AdminRecordingsActions {
  static recordingsRetrieved = defineAction({
    type: 'ee.client.AdminRecording.RECORDINGS_RETRIEVED',
    recordingsResult: matches.object as Validator<unknown, Paginated<RecordingResultFetch>>
  })

  static recordingsRemoved = defineAction({
    type: 'ee.client.AdminRecording.RECORDING_REMOVED_ROW',
    recording: matches.object as Validator<unknown, RecordingResult>
  })
}

export const AdminSingleRecordingState = defineState({
  name: 'AdminSingleRecordingState',
  initial: () => ({
    recording: null as RecordingResult | null
  })
})

export const AdminSingleRecordingService = {
  fetchSingleAdminRecording: async (id: RecordingResult['id']) => {
    const recording = await API.instance.client.service('recording').get(id)
    dispatchAction(AdminSingleRecordingsActions.recordingsRetrieved({ recording }))
  }
}

export class AdminSingleRecordingsActions {
  static recordingsRetrieved = defineAction({
    type: 'ee.client.AdminSingleRecording.RECORDING_RETRIEVED',
    recording: matches.object as Validator<unknown, RecordingResult>
  })
}

const singleRecordingFetchedReceptor = (
  action: typeof AdminSingleRecordingsActions.recordingsRetrieved.matches._TYPE
) => {
  const state = getMutableState(AdminSingleRecordingState)
  return state.merge({ recording: action.recording })
}

export const AdminSingleRecordingReceptors = {
  singleRecordingFetchedReceptor
}
